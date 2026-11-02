class Monitor extends ModelBase {

  constructor(connection?: Connection) {
    super();
    if (connection) {
      this.connectionObj = connection;
    }
  }

  async fetchRealtimeStats() {
    // 1. Connection states from pg_stat_activity
    const connSql = `
      SELECT 
        count(*)::integer AS total_connections,
        count(*) FILTER (WHERE state = 'active')::integer AS active_connections,
        count(*) FILTER (WHERE state = 'idle')::integer AS idle_connections,
        count(*) FILTER (WHERE state LIKE 'idle in transaction%')::integer AS idle_in_transaction,
        count(*) FILTER (WHERE wait_event_type IS NOT NULL AND state = 'active')::integer AS waiting_connections
      FROM pg_stat_activity 
      WHERE pid <> pg_backend_pid();
    `;

    // 2. Max connections setting
    const maxConnSql = `
      SELECT setting::integer AS max_connections 
      FROM pg_settings 
      WHERE name = 'max_connections';
    `;

    // 3. Database throughput and cache hit stats
    const dbStatSql = `
      SELECT 
        (xact_commit + xact_rollback)::bigint AS total_xact,
        xact_commit::bigint AS xact_commit,
        xact_rollback::bigint AS xact_rollback,
        blks_hit::bigint AS blks_hit,
        blks_read::bigint AS blks_read,
        ROUND((blks_hit::numeric / NULLIF(blks_hit + blks_read, 0)) * 100, 2) AS cache_hit_ratio
      FROM pg_stat_database 
      WHERE datname = current_database();
    `;

    const [connRes, maxConnRes, dbStatRes, activeQueries] = await Promise.all([
      this.query(connSql),
      this.query(maxConnSql),
      this.query(dbStatSql),
      this.fetchActiveQueries()
    ]);

    const connData = connRes.rows[0] || {};
    const maxConn = (maxConnRes.rows[0] && maxConnRes.rows[0].max_connections) || 100;
    const dbStat = dbStatRes.rows[0] || {};

    // Summed duration of currently active queries
    const summedQueryTimeMs = activeQueries
      .filter((q: any) => q.state === 'active')
      .reduce((acc: number, q: any) => acc + (parseFloat(q.duration_seconds) || 0) * 1000, 0);

    return {
      connections: {
        total: connData.total_connections || 0,
        active: connData.active_connections || 0,
        idle: connData.idle_connections || 0,
        idleInTransaction: connData.idle_in_transaction || 0,
        waiting: connData.waiting_connections || 0,
        max: maxConn,
        percent: Math.min(100, Math.round(((connData.total_connections || 0) / maxConn) * 100))
      },
      database: {
        totalXact: Number(dbStat.total_xact) || 0,
        xactCommit: Number(dbStat.xact_commit) || 0,
        xactRollback: Number(dbStat.xact_rollback) || 0,
        cacheHitRatio: dbStat.cache_hit_ratio !== null ? parseFloat(dbStat.cache_hit_ratio) : 100
      },
      summedQueryTimeMs: Math.round(summedQueryTimeMs),
      activeQueries: activeQueries
    };
  }

  async fetchActiveQueries() {
    const activeQueriesSql = `
      SELECT 
        pid,
        usename,
        COALESCE(application_name, '') AS application_name,
        COALESCE(client_hostname, '') AS client_hostname,
        COALESCE(client_addr::text, '') AS client_addr,
        client_port,
        state,
        COALESCE(wait_event_type, '') AS wait_event_type,
        COALESCE(wait_event, '') AS wait_event,
        ROUND(EXTRACT(EPOCH FROM (now() - query_start))::numeric, 2) AS duration_seconds,
        query,
        query_start
      FROM pg_stat_activity
      WHERE pid <> pg_backend_pid()
        AND state IS NOT NULL
        AND state <> 'idle'
      ORDER BY duration_seconds DESC
      LIMIT 100;
    `;

    const res = await this.query(activeQueriesSql);
    return res.rows || [];
  }

  async cancelQuery(pid: number) {
    const res = await this.q('SELECT pg_cancel_backend(%s) AS canceled;', pid);
    return res.rows[0] && res.rows[0].canceled;
  }

  async terminateQuery(pid: number) {
    const res = await this.q('SELECT pg_terminate_backend(%s) AS terminated;', pid);
    return res.rows[0] && res.rows[0].terminated;
  }

  async fetchStorageStats() {
    // 1. Current Database size
    const dbSizeSql = `
      SELECT 
        pg_database_size(current_database())::bigint AS db_size_bytes,
        pg_size_pretty(pg_database_size(current_database())) AS db_size_pretty;
    `;

    // 2. Buffer configurations from pg_settings
    const settingsSql = `
      SELECT name, setting, unit,
        CASE unit 
          WHEN '8kB' THEN setting::bigint * 8192
          WHEN 'kB'  THEN setting::bigint * 1024
          WHEN 'MB'  THEN setting::bigint * 1024 * 1024
          ELSE setting::bigint 
        END AS bytes
      FROM pg_settings 
      WHERE name IN ('shared_buffers', 'effective_cache_size', 'work_mem');
    `;

    // 3. Sum of all user indexes
    const indexSumSql = `
      SELECT 
        COALESCE(SUM(pg_relation_size(c.oid)), 0)::bigint AS total_indexes_bytes,
        pg_size_pretty(COALESCE(SUM(pg_relation_size(c.oid)), 0)::bigint) AS total_indexes_pretty
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'i' AND n.nspname NOT IN ('pg_catalog', 'information_schema');
    `;

    // 4. Top 10 tables by combined size
    const topTablesSql = `
      SELECT 
        schemaname || '.' || relname AS table_name,
        pg_table_size(relid)::bigint AS table_size_bytes,
        pg_size_pretty(pg_table_size(relid)) AS table_size_pretty,
        pg_indexes_size(relid)::bigint AS index_size_bytes,
        pg_size_pretty(pg_indexes_size(relid)) AS index_size_pretty,
        pg_total_relation_size(relid)::bigint AS total_size_bytes,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size_pretty,
        n_live_tup AS live_rows
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
      LIMIT 10;
    `;

    const [dbSizeRes, settingsRes, indexSumRes, topTablesRes] = await Promise.all([
      this.query(dbSizeSql),
      this.query(settingsSql),
      this.query(indexSumSql),
      this.query(topTablesSql)
    ]);

    const settingsMap: Record<string, number> = {};
    settingsRes.rows.forEach((r: any) => {
      settingsMap[r.name] = Number(r.bytes);
    });

    const sharedBuffers = settingsMap['shared_buffers'] || 0;
    const effectiveCache = settingsMap['effective_cache_size'] || 0;
    const workMem = settingsMap['work_mem'] || 0;

    const totalIndexesBytes = Number(indexSumRes.rows[0].total_indexes_bytes) || 0;
    const bufferPct = sharedBuffers > 0 ? Math.round((totalIndexesBytes / sharedBuffers) * 100) : 0;

    return {
      dbSizeBytes: Number(dbSizeRes.rows[0].db_size_bytes) || 0,
      dbSizePretty: dbSizeRes.rows[0].db_size_pretty || '0 Bytes',
      totalIndexesBytes: totalIndexesBytes,
      totalIndexesPretty: indexSumRes.rows[0].total_indexes_pretty || '0 Bytes',
      sharedBuffersBytes: sharedBuffers,
      sharedBuffersPretty: (global as any).ViewHelpers.formatBytes(sharedBuffers),
      effectiveCacheBytes: effectiveCache,
      effectiveCachePretty: (global as any).ViewHelpers.formatBytes(effectiveCache),
      workMemPretty: (global as any).ViewHelpers.formatBytes(workMem),
      bufferFitPercent: bufferPct,
      topTables: topTablesRes.rows || []
    };
  }

  async fetchVacuumStats() {
    // 1. In-progress vacuums
    let inProgress: any[] = [];
    try {
      const progRes = await this.query(`
        SELECT 
          p.pid,
          c.relname AS table_name,
          p.phase,
          p.heap_blks_total,
          p.heap_blks_scanned,
          ROUND((p.heap_blks_scanned::numeric / NULLIF(p.heap_blks_total, 0)) * 100, 1) AS percent_complete
        FROM pg_stat_progress_vacuum p
        JOIN pg_class c ON c.oid = p.relid;
      `);
      inProgress = progRes.rows || [];
    } catch (e) {
      // Might not be supported or allowed
    }

    // 2. Table bloat and last autovacuum
    const tableBloatSql = `
      SELECT 
        schemaname || '.' || relname AS table_name,
        n_live_tup AS live_rows,
        n_dead_tup AS dead_rows,
        ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 1) AS dead_pct,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze,
        autovacuum_count
      FROM pg_stat_user_tables
      WHERE n_dead_tup > 500 OR n_live_tup > 1000
      ORDER BY n_dead_tup DESC
      LIMIT 15;
    `;

    const bloatRes = await this.query(tableBloatSql);
    const tables = bloatRes.rows || [];
    const highBloatCount = tables.filter((t: any) => parseFloat(t.dead_pct) >= 20).length;

    return {
      inProgress: inProgress,
      tables: tables,
      highBloatCount: highBloatCount
    };
  }

  async fetchReplicationStats() {
    // Check if current node is a standby (replica)
    let isReplica = false;
    try {
      const recRes = await this.query(`SELECT pg_is_in_recovery() AS is_recovery;`);
      isReplica = recRes.rows[0] && recRes.rows[0].is_recovery;
    } catch (e) {
      isReplica = false;
    }

    let standbys: any[] = [];
    let walReceiver: any = null;
    let replicationSlots: any[] = [];
    let archiver: any = null;

    if (!isReplica) {
      // Primary node: check pg_stat_replication
      try {
        const repRes = await this.query(`
          SELECT 
            COALESCE(application_name, 'unknown') AS application_name,
            client_addr::text AS client_addr,
            state,
            sync_state,
            pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)) AS byte_lag,
            COALESCE(write_lag::text, '-') AS write_lag,
            COALESCE(flush_lag::text, '-') AS flush_lag,
            COALESCE(replay_lag::text, '-') AS replay_lag
          FROM pg_stat_replication;
        `);
        standbys = repRes.rows || [];
      } catch (e) {
        // Fallback or permission error
      }
    } else {
      // Replica node: check pg_stat_wal_receiver
      try {
        const walRecRes = await this.query(`
          SELECT 
            status,
            sender_host,
            sender_port,
            ROUND(EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::numeric, 2) AS lag_seconds,
            pg_last_xact_replay_timestamp() AS last_replayed_at
          FROM pg_stat_wal_receiver;
        `);
        walReceiver = walRecRes.rows[0] || null;
      } catch (e) {}
    }

    // Replication slots
    try {
      const slotsRes = await this.query(`
        SELECT 
          slot_name,
          plugin,
          active,
          pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal
        FROM pg_replication_slots
        ORDER BY active ASC, slot_name ASC;
      `);
      replicationSlots = slotsRes.rows || [];
    } catch (e) {}

    // Archiver status
    try {
      const archRes = await this.query(`
        SELECT 
          archived_count,
          failed_count,
          last_archived_time,
          last_failed_time,
          last_failed_wal
        FROM pg_stat_archiver;
      `);
      archiver = archRes.rows[0] || null;
    } catch (e) {}

    const inactiveSlotsCount = replicationSlots.filter((s: any) => !s.active).length;
    const isConfigured = Boolean(
      isReplica ||
      standbys.length > 0 ||
      replicationSlots.length > 0 ||
      walReceiver
    );

    return {
      isConfigured: isConfigured,
      isReplica: isReplica,
      standbys: standbys,
      walReceiver: walReceiver,
      replicationSlots: replicationSlots,
      inactiveSlotsCount: inactiveSlotsCount,
      archiver: archiver
    };
  }

  async fetchSlowQueries() {
    // Check if pg_stat_statements extension exists
    const extRes = await this.query(`
      SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements';
    `);

    const hasExtension = extRes.rows.length > 0;
    if (!hasExtension) {
      return {
        hasExtension: false,
        queries: []
      };
    }

    // Check version to handle total_exec_time vs total_time
    let sql = `
      SELECT 
        round(total_exec_time::numeric, 2) AS total_time_ms,
        round(mean_exec_time::numeric, 2)  AS avg_time_ms,
        round(max_exec_time::numeric, 2)   AS max_time_ms,
        calls,
        rows,
        query
      FROM pg_stat_statements
      ORDER BY mean_exec_time DESC
      LIMIT 15;
    `;

    try {
      const res = await this.query(sql);
      return {
        hasExtension: true,
        queries: res.rows || []
      };
    } catch (e) {
      // Fallback for PostgreSQL < 13
      try {
        const legacySql = `
          SELECT 
            round(total_time::numeric, 2) AS total_time_ms,
            round(mean_time::numeric, 2)  AS avg_time_ms,
            calls,
            rows,
            query
          FROM pg_stat_statements
          ORDER BY mean_time DESC
          LIMIT 15;
        `;
        const legacyRes = await this.query(legacySql);
        return {
          hasExtension: true,
          queries: legacyRes.rows || []
        };
      } catch (err) {
        return {
          hasExtension: false,
          error: (err as any).toString(),
          queries: []
        };
      }
    }
  }
}

declare var Monitor__: typeof Monitor;

module.exports = Monitor;
(global as any).Monitor = Monitor;
