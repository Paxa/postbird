class Monitoring extends PaneBase {

  model: any;
  isLive: boolean;
  pollTimer: any;
  pollInterval: number = 3000;

  // Rolling history for charts
  qpsHistory: number[] = [];
  latencyHistory: number[] = [];
  prevXact: number | null = null;
  prevSampleTime: number | null = null;

  // Section states
  expandedSections: { [key: string]: boolean } = {
    overview: true,
    queries: false,
    storage: false,
    vacuum: false,
    replication: false,
    slow_queries: false,
    indexes: false
  };

  sectionSummaries: { [key: string]: string } = {
    overview: '',
    queries: 'Click to load active queries',
    storage: 'Click to load storage & index footprint',
    vacuum: 'Click to load vacuum & bloat health',
    replication: 'Click to load replication & WAL stats',
    slow_queries: 'Click to load query execution insights',
    indexes: 'Click to analyze unused & duplicate indexes'
  };

  // Section data caches
  overviewData: any = null;
  queriesData: any = null;
  storageData: any = null;
  vacuumData: any = null;
  replicationData: any = null;
  slowQueryData: any = null;
  indexesData: any = null;

  private tabChangeListenerBound: boolean = false;

  constructor(view: DbScreenView) {
    super(view);
    this.model = new (Model as any).Monitor(this.handler.connection);
    this.isLive = localStorage.getItem('postbird:monitor:live') !== 'false';

    try {
      const saved = localStorage.getItem('postbird:monitor:sections');
      if (saved) {
        this.expandedSections = Object.assign(this.expandedSections, JSON.parse(saved));
      }
    } catch (e) {}

    // Prepopulate rolling history with zeros
    for (let i = 0; i < 30; i++) {
      this.qpsHistory.push(0);
      this.latencyHistory.push(0);
    }

    if (!this.tabChangeListenerBound) {
      App.on('dbtab.changed', (tab: string) => {
        if (tab === 'monitoring') {
          if (this.isLive) this.startPolling();
        } else {
          this.stopPolling();
        }
      });
      this.tabChangeListenerBound = true;
    }
  }

  async renderTab() {
    this.model = new (Model as any).Monitor(this.handler.connection);

    // Initial render of template shell
    this.renderViewToPane('monitoring', 'monitoring_tab', {
      isLive: this.isLive,
      expandedSections: this.expandedSections,
      sectionSummaries: this.sectionSummaries,
      overviewData: this.overviewData,
      storageData: this.storageData,
      vacuumData: this.vacuumData,
      replicationData: this.replicationData,
      slowQueryData: this.slowQueryData,
      indexesData: this.indexesData,
      qpsChartSvg: (Sparkline as any).renderSvg(this.qpsHistory, { strokeColor: '#007aff', unit: ' qps' }),
      latencyChartSvg: (Sparkline as any).renderSvg(this.latencyHistory, { strokeColor: '#ff9500', unit: ' ms' })
    });

    this.bindDomEvents();

    // Fetch initial data
    await this.fetchOverview();

    // Check replication to show or hide the section
    this.fetchReplication(true);

    // If non-overview sections were saved as expanded, load them too
    if (this.expandedSections.queries && !this.queriesData) this.fetchQueries();
    if (this.expandedSections.storage && !this.storageData) this.fetchStorage();
    if (this.expandedSections.vacuum && !this.vacuumData) this.fetchVacuum();
    if (this.expandedSections.slow_queries && !this.slowQueryData) this.fetchSlowQueries();
    if (this.expandedSections.indexes && !this.indexesData) this.fetchIndexes();

    if (this.isLive) {
      this.startPolling();
    }
  }

  bindDomEvents() {
    // 1. Live monitoring toggle
    this.content.find('.btn-toggle-live').on('click', (e: any) => {
      e.preventDefault();
      this.toggleLive();
    });

    // 2. Global refresh
    this.content.find('.btn-global-refresh').on('click', (e: any) => {
      e.preventDefault();
      this.refreshAll();
    });

    // 3. Section disclosure headers
    this.content.find('.monitor-section-header').on('click', (e: any) => {
      // Don't trigger expand/collapse if clicking an action button inside the header
      if ($u(e.target).closest('.section-actions').length > 0) return;
      const section = $u(e.currentTarget).closest('.monitor-section').attr('data-section');
      if (section) this.toggleSection(section);
    });

    // 4. Section-specific refresh buttons
    this.content.find('.btn-section-refresh').on('click', (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      const section = $u(e.currentTarget).closest('.monitor-section').attr('data-section');
      if (section) this.refreshSection(section);
    });

    // 5. Query action buttons (View SQL / Cancel / Terminate)
    this.content.on('click', '.btn-view-query, .active-queries-table .query-cell', (e: any) => {
      e.preventDefault();
      const tr = $u(e.currentTarget).closest('tr');
      const pid = parseInt($u(e.currentTarget).attr('data-pid') || tr.attr('data-pid'), 10);
      const queryObj = (this.queriesData || []).find((q: any) => q.pid === pid);
      if (queryObj && queryObj.query) {
        const clientDesc = [queryObj.application_name, queryObj.client_addr].filter(Boolean).join(' • ') || 'Active Query';
        new (Dialog as any).ShowSql(`Running Query (PID ${queryObj.pid} • ${clientDesc})`, queryObj.query);
      }
    });

    this.content.on('click', '.btn-cancel-query', (e: any) => {
      const pid = parseInt($u(e.currentTarget).attr('data-pid'), 10);
      if (pid) this.cancelQuery(pid);
    });

    this.content.on('click', '.btn-terminate-query', (e: any) => {
      const pid = parseInt($u(e.currentTarget).attr('data-pid'), 10);
      if (pid) this.terminateQuery(pid);
    });

    // 6. Slow query actions (View SQL modal & refresh)
    this.content.on('click', '.btn-view-slow-query, .slow-queries-table .query-cell', (e: any) => {
      e.preventDefault();
      const tr = $u(e.currentTarget).closest('tr');
      const idx = parseInt($u(e.currentTarget).attr('data-index') || tr.attr('data-index'), 10);
      const queryObj = this.slowQueryData?.queries?.[idx];
      if (queryObj && queryObj.query) {
        const targetTable = queryObj.target_table || (global as any).ViewHelpers.extractTargetTable(queryObj.query);
        const avgStr = queryObj.avg_time_pretty || (global as any).ViewHelpers.formatDurationMs(queryObj.avg_time_ms);
        const title = `Slow Query (${targetTable !== '-' ? targetTable + ' • ' : ''}Avg: ${avgStr})`;
        new (Dialog as any).ShowSql(title, queryObj.query);
      }
    });

    this.content.on('click', '.btn-refresh-slow-queries', (e: any) => {
      e.preventDefault();
      this.fetchSlowQueries();
    });

    // 7. Install pg_stat_statements button
    this.content.on('click', '.btn-install-statements', async (e: any) => {
      e.preventDefault();
      try {
        App.startLoading('Enabling pg_stat_statements extension...');
        await this.handler.connection.q('CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
        $u.alert('Enabled pg_stat_statements extension', { info: 'info' });
        await this.fetchSlowQueries();
      } catch (err: any) {
        $u.alertError('Cannot enable extension', { detail: err.toString() });
      } finally {
        App.stopLoading();
      }
    });

    // 8. Index optimization actions
    this.content.on('click', '.btn-refresh-indexes', (e: any) => {
      e.preventDefault();
      this.fetchIndexes();
    });

    this.content.on('click', '.btn-copy-drop-index', (e: any) => {
      e.preventDefault();
      const sql = $u(e.currentTarget).attr('data-sql');
      if (sql) {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(sql);
        } else if (electronRemote && electronRemote.clipboard) {
          electronRemote.clipboard.writeText(sql);
        }
        const btn = $u(e.currentTarget);
        btn.text('Copied!');
        setTimeout(() => { btn.text('Copy DROP SQL'); }, 1500);
      }
    });
  }

  toggleLive() {
    this.isLive = !this.isLive;
    localStorage.setItem('postbird:monitor:live', String(this.isLive));

    const btn = this.content.find('.btn-toggle-live');
    if (this.isLive) {
      btn.addClass('active').attr('title', 'Pause Live Monitoring');
      btn.find('.live-status-text').text('Live Monitoring (3s)');
      this.startPolling();
    } else {
      btn.removeClass('active').attr('title', 'Resume Live Monitoring');
      btn.find('.live-status-text').text('Monitoring Paused');
      this.stopPolling();
    }
  }

  startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(() => {
      if (this.view.currentTab === 'monitoring') {
        this.fetchOverview(true);
      }
    }, this.pollInterval);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  toggleSection(sectionKey: string) {
    const isExpanded = !this.expandedSections[sectionKey];
    this.expandedSections[sectionKey] = isExpanded;
    try {
      localStorage.setItem('postbird:monitor:sections', JSON.stringify(this.expandedSections));
    } catch (e) {}

    const sectionEl = this.content.find(`.monitor-section[data-section="${sectionKey}"]`);
    if (isExpanded) {
      sectionEl.addClass('expanded');
      // Load data if empty
      if (sectionKey === 'queries' && !this.queriesData) this.fetchQueries();
      if (sectionKey === 'storage' && !this.storageData) this.fetchStorage();
      if (sectionKey === 'vacuum' && !this.vacuumData) this.fetchVacuum();
      if (sectionKey === 'replication' && !this.replicationData) this.fetchReplication();
      if (sectionKey === 'slow_queries' && !this.slowQueryData) this.fetchSlowQueries();
      if (sectionKey === 'indexes' && !this.indexesData) this.fetchIndexes();
    } else {
      sectionEl.removeClass('expanded');
    }
  }

  async refreshSection(sectionKey: string) {
    switch (sectionKey) {
      case 'overview':
        return this.fetchOverview();
      case 'queries':
        return this.fetchQueries();
      case 'storage':
        return this.fetchStorage();
      case 'vacuum':
        return this.fetchVacuum();
      case 'replication':
        return this.fetchReplication();
      case 'slow_queries':
        return this.fetchSlowQueries();
      case 'indexes':
        return this.fetchIndexes();
    }
  }

  async refreshAll() {
    App.startLoading('Refreshing monitoring metrics...');
    try {
      await Promise.all([
        this.fetchOverview(),
        this.fetchQueries(),
        this.fetchStorage(),
        this.fetchVacuum(),
        this.fetchReplication(),
        this.fetchSlowQueries(),
        this.fetchIndexes()
      ]);
    } finally {
      App.stopLoading();
    }
  }

  async fetchOverview(isSilent: boolean = false) {
    try {
      const data = await this.model.fetchRealtimeStats();
      this.overviewData = data;

      // Calculate QPS delta
      const now = Date.now();
      let qps = 0;
      if (this.prevXact !== null && this.prevSampleTime !== null) {
        const timeDiffSec = Math.max(0.5, (now - this.prevSampleTime) / 1000);
        const xactDiff = Math.max(0, data.database.totalXact - this.prevXact);
        qps = Math.round(xactDiff / timeDiffSec);
      }
      this.prevXact = data.database.totalXact;
      this.prevSampleTime = now;

      // Push to rolling history
      this.qpsHistory.push(qps);
      if (this.qpsHistory.length > 30) this.qpsHistory.shift();

      this.latencyHistory.push(data.summedQueryTimeMs);
      if (this.latencyHistory.length > 30) this.latencyHistory.shift();

      // Update Section Summary
      this.sectionSummaries.overview = `${data.connections.total}/${data.connections.max} conns • ${data.database.cacheHitRatio}% cache hit • ${qps} QPS • ${data.activeQueries.length} active queries`;
      this.updateSectionSummary('overview', this.sectionSummaries.overview);

      // Render updated Overview Content DOM
      this.updateOverviewDom(qps);
    } catch (error) {
      if (!isSilent) {
        $u.alertError('Failed to fetch overview metrics', { detail: (error as any).toString() });
      }
    }
  }

  updateOverviewDom(currentQps: number) {
    const sec = this.content.find('.monitor-section[data-section="overview"]');
    if (!sec.length || !this.overviewData) return;

    const d = this.overviewData;

    // 1. KPI Cards
    sec.find('.metric-conns-val').text(`${d.connections.total} / ${d.connections.max}`);
    sec.find('.metric-conns-sub').text(`${d.connections.active} active, ${d.connections.idleInTransaction} idle in tx`);
    sec.find('.metric-conns-bar').css('width', `${d.connections.percent}%`);

    sec.find('.metric-cache-val').text(`${d.database.cacheHitRatio}%`);
    sec.find('.metric-cache-sub').text(d.database.cacheHitRatio >= 99 ? '🟢 Optimal buffer cache' : '🟡 High disk read ratio');

    sec.find('.metric-qps-val').text(`${currentQps} tx/s`);
    const commits = Number(d.database.xactCommit || 0).toLocaleString();
    const rollbacks = Number(d.database.xactRollback || 0).toLocaleString();
    sec.find('.metric-qps-sub').text(`${commits} commits, ${rollbacks} rollbacks`);

    sec.find('.metric-load-val').text(`${d.summedQueryTimeMs} ms`);
    sec.find('.metric-load-sub').text(`${d.activeQueries.length} running or waiting`);

    // 2. Charts
    const qpsSvg = (Sparkline as any).renderSvg(this.qpsHistory, { strokeColor: '#007aff', unit: ' tx/s' });
    sec.find('.chart-container-qps').html(qpsSvg);

    const latSvg = (Sparkline as any).renderSvg(this.latencyHistory, { strokeColor: '#ff9500', unit: ' ms' });
    sec.find('.chart-container-latency').html(latSvg);
  }

  async fetchQueries(isSilent: boolean = false) {
    try {
      const queries = await this.model.fetchActiveQueries();
      this.queriesData = queries;

      // Update Section Summary
      if (!queries || queries.length === 0) {
        this.sectionSummaries.queries = 'No active client queries';
      } else {
        const longest = queries[0]?.duration_seconds || 0;
        this.sectionSummaries.queries = `${queries.length} active or waiting queries (longest: ${longest}s)`;
      }
      this.updateSectionSummary('queries', this.sectionSummaries.queries);

      this.updateQueriesDom(queries);
    } catch (e: any) {
      if (!isSilent) {
        $u.alertError('Failed to fetch active queries', { detail: e.toString() });
      }
    }
  }

  updateQueriesDom(queries: any[]) {
    const sec = this.content.find('.monitor-section[data-section="queries"]');
    if (!sec.length) return;

    // Check lock contention & blocked queries
    const blockedQueries = (queries || []).filter((q: any) => q.is_blocked);
    const banner = sec.find('.lock-conflicts-banner');
    if (blockedQueries.length > 0) {
      const blockerPids = Array.from(new Set(blockedQueries.flatMap((q: any) => q.blocking_pids)));
      banner.html(`
        <strong>⚠️ Lock Contention Detected:</strong>
        <span>${blockedQueries.length} query(ies) are currently waiting on locks held by PID: <strong>${blockerPids.join(', ')}</strong></span>
      `).show();
    } else {
      banner.hide();
    }

    const tbody = sec.find('.active-queries-table tbody');
    tbody.empty();

    if (!queries || queries.length === 0) {
      tbody.html('<tr><td colspan="9" class="text-muted text-center" style="padding: 16px;">No active client queries executing currently.</td></tr>');
      return;
    }

    queries.forEach((q: any) => {
      const isLong = parseFloat(q.duration_seconds) > 5;
      const durationClass = isLong ? 'badge-danger' : 'badge-normal';
      const waitBadge = q.wait_event ? `<span class="wait-badge" title="${q.wait_event_type}">${q.wait_event}</span>` : '<span class="text-muted">-</span>';
      const clientName = q.application_name || q.client_hostname || '-';
      const clientAddr = q.client_addr ? (q.client_addr + (q.client_port ? ':' + q.client_port : '')) : 'local (unix)';
      const queryText = q.query || '';

      let stateBadge = `<span class="state-pill state-${q.state}">${q.state}</span>`;
      if (q.is_blocked) {
        stateBadge += ` <span class="lock-badge badge-blocked" title="Blocked by PID ${q.blocking_pids.join(', ')}">⛔ Blocked (${q.blocking_pids.join(', ')})</span>`;
      }
      if (q.blocking_count > 0) {
        stateBadge += ` <span class="lock-badge badge-blocker" title="Holding locks blocking ${q.blocking_count} query(ies)">⚠️ Blocker (${q.blocking_count})</span>`;
      }

      const rowClass = q.blocking_count > 0 ? 'row-blocker' : (q.is_blocked ? 'row-blocked' : '');

      const killBtn = q.blocking_count > 0 
        ? `<button class="btn-native-small btn-terminate-query" data-pid="${q.pid}" title="Kill Blocker Backend (pg_terminate_backend)" style="color: #d70015; font-weight: 600;">Kill Blocker</button>`
        : `<button class="btn-native-small btn-terminate-query" data-pid="${q.pid}" title="Terminate Connection (pg_terminate_backend)">Kill</button>`;

      const row = `
        <tr data-pid="${q.pid}" class="${rowClass}">
          <td><strong>${q.pid}</strong></td>
          <td>${q.usename || '-'}</td>
          <td title="${clientName}"><strong>${clientName}</strong></td>
          <td class="text-muted" title="${clientAddr}"><small>${clientAddr}</small></td>
          <td>${stateBadge}</td>
          <td>${waitBadge}</td>
          <td><span class="duration-badge ${durationClass}">${q.duration_seconds}s</span></td>
          <td class="query-cell" data-pid="${q.pid}" title="Click to view full SQL&#10;${(global as any).ViewHelpers.escapeHTML(queryText)}"><code>${(global as any).ViewHelpers.escapeHTML(queryText.substring(0, 100))}</code></td>
          <td class="actions-cell">
            <button class="btn-native-small btn-view-query" data-pid="${q.pid}" title="View Full SQL">View SQL</button>
            <button class="btn-native-small btn-cancel-query" data-pid="${q.pid}" title="Cancel Query (pg_cancel_backend)">Cancel</button>
            ${killBtn}
          </td>
        </tr>
      `;
      tbody.append(row);
    });
  }

  async fetchStorage() {
    try {
      const data = await this.model.fetchStorageStats();
      this.storageData = data;

      // Update Section Summary
      this.sectionSummaries.storage = `DB: ${data.dbSizePretty} • Indexes: ${data.totalIndexesPretty} (${data.bufferFitPercent}% of shared_buffers)`;
      this.updateSectionSummary('storage', this.sectionSummaries.storage);

      const sec = this.content.find('.monitor-section[data-section="storage"]');
      if (!sec.length) return;

      // Update Gauge Bar & Badges
      const pct = Math.round(data.bufferFitPercent || 0);
      const fillPct = Math.min(100, Math.max(0, pct));
      const fill = sec.find('.storage-gauge-fill');
      const badge = sec.find('.storage-fit-badge');

      fill.css('width', `${fillPct}%`);
      sec.find('.storage-gauge-text').text(
        `${data.totalIndexesPretty} indexes / ${data.sharedBuffersPretty} shared_buffers (${pct}%)`
      );

      fill.removeClass('fill-normal fill-warning fill-danger');
      badge.removeClass('badge-fit-normal badge-fit-warning badge-fit-danger');

      if (pct > 100) {
        fill.addClass('fill-danger');
        badge.addClass('badge-fit-danger').text(`${pct}% • Exceeds shared_buffers`);
      } else if (pct >= 80) {
        fill.addClass('fill-warning');
        badge.addClass('badge-fit-warning').text(`${pct}% • Near Buffer Limit`);
      } else {
        fill.addClass('fill-normal');
        badge.addClass('badge-fit-normal').text(`${pct}% • Fits in Memory`);
      }

      // Update Metric Chips
      sec.find('.storage-db-size-val').text(data.dbSizePretty || '-');
      sec.find('.storage-index-size-val').text(data.totalIndexesPretty || '-');
      sec.find('.storage-buffers-val').text(data.sharedBuffersPretty || '-');
      sec.find('.storage-cache-val').text(data.effectiveCachePretty || '-');
      sec.find('.storage-workmem-val').text(data.workMemPretty || '-');

      // Update Tables List
      const tbody = sec.find('.top-tables-table tbody');
      tbody.empty();
      data.topTables.forEach((t: any) => {
        tbody.append(`
          <tr>
            <td><strong>${t.table_name}</strong></td>
            <td>${Number(t.live_rows).toLocaleString()}</td>
            <td>${t.table_size_pretty}</td>
            <td>${t.index_size_pretty}</td>
            <td><strong>${t.total_size_pretty}</strong></td>
          </tr>
        `);
      });
    } catch (e: any) {
      $u.alertError('Failed to fetch storage stats', { detail: e.toString() });
    }
  }

  async fetchVacuum() {
    try {
      const data = await this.model.fetchVacuumStats();
      this.vacuumData = data;

      this.sectionSummaries.vacuum = `${data.highBloatCount} tables with >20% dead rows • ${data.inProgress.length} active vacuums`;
      this.updateSectionSummary('vacuum', this.sectionSummaries.vacuum);

      const sec = this.content.find('.monitor-section[data-section="vacuum"]');
      if (!sec.length) return;

      // In progress vacuums
      const progBlock = sec.find('.vacuum-progress-block');
      if (data.inProgress.length > 0) {
        progBlock.show().empty();
        data.inProgress.forEach((p: any) => {
          progBlock.append(`
            <div class="active-vacuum-pill">
              <strong>Active Vacuum:</strong> Table <code>${p.table_name}</code> (PID ${p.pid}) — Phase: <em>${p.phase}</em> (${p.percent_complete}% scanned)
            </div>
          `);
        });
      } else {
        progBlock.hide();
      }

      // Bloat Table
      const tbody = sec.find('.table-bloat-table tbody');
      tbody.empty();
      if (data.tables.length === 0) {
        tbody.html('<tr><td colspan="7" class="text-muted text-center" style="padding: 16px;">All user tables have healthy tuple statistics.</td></tr>');
      } else {
        data.tables.forEach((t: any) => {
          const isHigh = parseFloat(t.dead_pct) >= 20;
          const pctClass = isHigh ? 'badge-danger' : 'badge-normal';
          const lastAuto = t.last_autovacuum ? (global as any).ViewHelpers.timeFormat(new Date(t.last_autovacuum)) : 'Never';

          tbody.append(`
            <tr>
              <td><strong>${t.table_name}</strong></td>
              <td>${Number(t.live_rows).toLocaleString()}</td>
              <td>${Number(t.dead_rows).toLocaleString()}</td>
              <td><span class="duration-badge ${pctClass}">${t.dead_pct}%</span></td>
              <td>${lastAuto}</td>
              <td>${t.autovacuum_count || 0}</td>
              <td>${isHigh ? '⚠️ Needs VACUUM' : '🟢 Healthy'}</td>
            </tr>
          `);
        });
      }
    } catch (e: any) {
      $u.alertError('Failed to fetch vacuum stats', { detail: e.toString() });
    }
  }

  async fetchReplication(isSilent: boolean = false) {
    try {
      const data = await this.model.fetchReplicationStats();
      this.replicationData = data;

      const sec = this.content.find('.monitor-section[data-section="replication"]');
      if (!sec.length) return;

      if (!data.isConfigured) {
        sec.hide();
        return;
      }

      sec.show();

      const role = data.isReplica ? 'Standby Node' : 'Primary Node';
      const standbySummary = data.standbys.length > 0 ? `${data.standbys.length} standbys connected` : 'Single node';
      const slotSummary = `${data.inactiveSlotsCount} inactive slots`;
      this.sectionSummaries.replication = `${role} • ${standbySummary} • ${slotSummary}`;
      this.updateSectionSummary('replication', this.sectionSummaries.replication);

      // Standby / Receiver Table
      const tbody = sec.find('.replication-nodes-table tbody');
      tbody.empty();

      if (data.isReplica) {
        if (data.walReceiver) {
          tbody.append(`
            <tr>
              <td><strong>Upstream: ${data.walReceiver.sender_host}:${data.walReceiver.sender_port}</strong></td>
              <td>Standby (Receiver)</td>
              <td><span class="state-pill state-active">${data.walReceiver.status}</span></td>
              <td>${data.walReceiver.lag_seconds}s lag</td>
              <td>Last replayed: ${data.walReceiver.last_replayed_at || '-'}</td>
            </tr>
          `);
        } else {
          tbody.html('<tr><td colspan="5" class="text-muted text-center">Connected as Standby, but wal_receiver is inactive.</td></tr>');
        }
      } else {
        if (data.standbys.length === 0) {
          tbody.html('<tr><td colspan="5" class="text-muted text-center" style="padding: 14px;">No streaming replication standbys connected.</td></tr>');
        } else {
          data.standbys.forEach((s: any) => {
            tbody.append(`
              <tr>
                <td><strong>${s.application_name}</strong> (${s.client_addr || 'local'})</td>
                <td>${s.sync_state}</td>
                <td><span class="state-pill state-active">${s.state}</span></td>
                <td><strong>${s.byte_lag}</strong></td>
                <td>Write: ${s.write_lag} / Replay: ${s.replay_lag}</td>
              </tr>
            `);
          });
        }
      }

      // Slots
      const slotsList = sec.find('.replication-slots-list');
      slotsList.empty();
      if (data.replicationSlots.length === 0) {
        slotsList.html('<span class="text-muted">No replication slots configured.</span>');
      } else {
        data.replicationSlots.forEach((slot: any) => {
          const slotClass = slot.active ? 'slot-active' : 'slot-inactive-warning';
          slotsList.append(`
            <div class="replication-slot-item ${slotClass}">
              <strong>${slot.slot_name}</strong> (${slot.plugin || 'physical'}): 
              ${slot.active ? '🟢 Active' : '🔴 Inactive (Warning)'} — Retaining <strong>${slot.retained_wal}</strong> WAL
            </div>
          `);
        });
      }
    } catch (e: any) {
      const sec = this.content.find('.monitor-section[data-section="replication"]');
      if (sec.length) sec.hide();
      if (!isSilent) {
        $u.alertError('Failed to fetch replication stats', { detail: e.toString() });
      }
    }
  }

  async fetchSlowQueries() {
    try {
      const data = await this.model.fetchSlowQueries();
      this.slowQueryData = data;

      const sec = this.content.find('.monitor-section[data-section="slow_queries"]');
      if (!sec.length) return;

      if (!data.hasExtension) {
        this.sectionSummaries.slow_queries = 'pg_stat_statements: extension not enabled';
        this.updateSectionSummary('slow_queries', this.sectionSummaries.slow_queries);

        sec.find('.slow-queries-not-installed').show();
        sec.find('.slow-queries-installed').hide();
      } else {
        this.sectionSummaries.slow_queries = `pg_stat_statements: active (${data.queries.length} queries listed)`;
        this.updateSectionSummary('slow_queries', this.sectionSummaries.slow_queries);

        sec.find('.slow-queries-not-installed').hide();
        sec.find('.slow-queries-installed').show();

        const tbody = sec.find('.slow-queries-table tbody');
        tbody.empty();
        if (data.queries.length === 0) {
          tbody.html('<tr><td colspan="7" class="text-muted text-center" style="padding: 16px;">No query statistics recorded yet in pg_stat_statements.</td></tr>');
        } else {
          data.queries.forEach((q: any, idx: number) => {
            const rawAvg = `${Number(q.avg_time_ms).toLocaleString()} ms`;
            const rawMax = q.max_time_ms ? `${Number(q.max_time_ms).toLocaleString()} ms` : '-';
            const prettyAvg = q.avg_time_pretty || (global as any).ViewHelpers.formatDurationMs(q.avg_time_ms);
            const prettyMax = q.max_time_pretty || (global as any).ViewHelpers.formatDurationMs(q.max_time_ms);
            const targetTable = q.target_table || (global as any).ViewHelpers.extractTargetTable(q.query || '');
            const queryText = q.query || '';
            const escapedQuery = (global as any).ViewHelpers.escapeHTML(queryText);
            const previewText = (global as any).ViewHelpers.escapeHTML(queryText.substring(0, 140));

            tbody.append(`
              <tr data-index="${idx}">
                <td title="Exact: ${rawAvg}"><strong>${prettyAvg}</strong></td>
                <td title="Exact: ${rawMax}">${prettyMax}</td>
                <td>${Number(q.calls).toLocaleString()}</td>
                <td>${Number(q.rows).toLocaleString()}</td>
                <td><strong class="table-name-badge">${(global as any).ViewHelpers.escapeHTML(targetTable)}</strong></td>
                <td class="query-cell clickable-query-cell" data-index="${idx}" title="Click to view full SQL&#10;${escapedQuery}"><code>${previewText}</code></td>
                <td class="actions-cell">
                  <button class="btn-native-small btn-view-slow-query" data-index="${idx}" title="View Full SQL">View SQL</button>
                </td>
              </tr>
            `);
          });
        }
      }
    } catch (e: any) {
      $u.alertError('Failed to fetch slow queries', { detail: e.toString() });
    }
  }

  async fetchIndexes(isSilent: boolean = false) {
    try {
      const data = await this.model.fetchIndexHealth();
      this.indexesData = data;

      const unusedCount = data.unused.length;
      const dupCount = data.duplicates.length;
      this.sectionSummaries.indexes = `${unusedCount} unused (${data.totalUnusedSizePretty}) • ${dupCount} duplicate`;
      this.updateSectionSummary('indexes', this.sectionSummaries.indexes);

      const sec = this.content.find('.monitor-section[data-section="indexes"]');
      if (!sec.length) return;

      // 1. Unused indexes table
      const unusedTbody = sec.find('.unused-indexes-table tbody');
      unusedTbody.empty();
      if (data.unused.length === 0) {
        unusedTbody.html('<tr><td colspan="5" class="text-muted text-center" style="padding: 14px;">🟢 No unused indexes detected. All user indexes are actively scanned!</td></tr>');
      } else {
        data.unused.forEach((idx: any) => {
          const dropSql = `DROP INDEX CONCURRENTLY IF EXISTS "${idx.schemaname}"."${idx.index_name}";`;
          unusedTbody.append(`
            <tr>
              <td><strong>${(global as any).ViewHelpers.escapeHTML(idx.table_name)}</strong></td>
              <td><code>${(global as any).ViewHelpers.escapeHTML(idx.index_name)}</code></td>
              <td><strong>${idx.index_size_pretty}</strong></td>
              <td><span class="state-pill state-idle">0 scans</span></td>
              <td class="actions-cell">
                <button class="btn-native-small btn-copy-drop-index" data-sql="${(global as any).ViewHelpers.escapeHTML(dropSql)}" title="Copy DROP INDEX SQL">Copy DROP SQL</button>
              </td>
            </tr>
          `);
        });
      }

      // 2. Duplicate indexes table
      const dupTbody = sec.find('.duplicate-indexes-table tbody');
      dupTbody.empty();
      if (data.duplicates.length === 0) {
        dupTbody.html('<tr><td colspan="5" class="text-muted text-center" style="padding: 14px;">🟢 No duplicate or redundant indexes detected.</td></tr>');
      } else {
        data.duplicates.forEach((idx: any) => {
          const dropSql = `DROP INDEX CONCURRENTLY IF EXISTS ${idx.index_name};`;
          dupTbody.append(`
            <tr>
              <td><strong>${(global as any).ViewHelpers.escapeHTML(idx.table_name)}</strong></td>
              <td><code>${(global as any).ViewHelpers.escapeHTML(idx.index_name)}</code></td>
              <td><span class="text-muted">Redundant of</span> <code>${(global as any).ViewHelpers.escapeHTML(idx.duplicate_of)}</code></td>
              <td><strong>${idx.index_size_pretty}</strong></td>
              <td class="actions-cell">
                <button class="btn-native-small btn-copy-drop-index" data-sql="${(global as any).ViewHelpers.escapeHTML(dropSql)}" title="Copy DROP INDEX SQL">Copy DROP SQL</button>
              </td>
            </tr>
          `);
        });
      }
    } catch (e: any) {
      if (!isSilent) {
        $u.alertError('Failed to analyze indexes', { detail: e.toString() });
      }
    }
  }

  updateSectionSummary(sectionKey: string, summary: string) {
    this.content.find(`.monitor-section[data-section="${sectionKey}"] .section-summary-text`).text(summary);
  }

  async cancelQuery(pid: number) {
    if (!confirm(`Are you sure you want to cancel the query for backend PID ${pid}? (pg_cancel_backend)`)) return;
    try {
      App.startLoading(`Canceling query PID ${pid}...`);
      const success = await this.model.cancelQuery(pid);
      if (success) {
        $u.alert(`Query PID ${pid} has been canceled.`, { info: 'info' });
        await this.fetchOverview();
        await this.fetchQueries();
      } else {
        $u.alert(`Could not cancel query PID ${pid} (query may have already finished).`, { info: 'warn' });
      }
    } catch (err: any) {
      $u.alertError(`Failed to cancel query PID ${pid}`, { detail: err.toString() });
    } finally {
      App.stopLoading();
    }
  }

  async terminateQuery(pid: number) {
    if (!confirm(`Force terminate session PID ${pid}? This will close the client connection completely.`)) return;
    try {
      App.startLoading(`Terminating connection PID ${pid}...`);
      const success = await this.model.terminateQuery(pid);
      if (success) {
        $u.alert(`Connection PID ${pid} terminated.`, { info: 'info' });
        await this.fetchOverview();
        await this.fetchQueries();
      } else {
        $u.alert(`Could not terminate session PID ${pid}.`, { info: 'warn' });
      }
    } catch (err: any) {
      $u.alertError(`Failed to terminate connection PID ${pid}`, { detail: err.toString() });
    } finally {
      App.stopLoading();
    }
  }
}

declare var Monitoring__: typeof Monitoring;

module.exports = Monitoring;
(global as any).Monitoring = Monitoring;
