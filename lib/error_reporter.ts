var colors = require('./colors').safe;
var logger = require('../app/logger').make('info');

const SUPPORT_EMAIL = 'pavel.evst@gmail.com';
const GITHUB_ISSUES_URL = 'https://github.com/Paxa/postbird/issues/new';

const IGNORED_ERROR_MESSAGES = [
  'server closed the connection unexpectedly',
  'Unable to set non-blocking to true',
  'Client has encountered a connection error and is not queryable',
  'Connection terminated',
  'current transaction is aborted,',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ECONNRESET',
  'ENOTFOUND',
  'EPIPE',
];

const seenSignatures = new Set<string>();
let isPromptOpen = false;

/**
 * Scrub local usernames and PostgreSQL connection strings from error text.
 */
function sanitizeText(input: string): string {
  if (!input) return '';
  return String(input)
    .replace(/postgres(?:ql)?:\/\/[^\s'"]+/gi, 'postgres://***@***')
    .replace(/(\/Users\/)[^/\s]+/g, '$1<user>')
    .replace(/(\/home\/)[^/\s]+/g, '$1<user>')
    .replace(/([A-Za-z]:\\Users\\)[^\\\s]+/g, '$1<user>');
}

function getErrorMessage(exception: any): string {
  if (!exception) return 'Unknown error';
  if (typeof exception === 'string') return exception;
  if (exception.message) return String(exception.message);
  try {
    return String(exception);
  } catch {
    return 'Unknown error';
  }
}

function getErrorStack(exception: any): string {
  if (exception && typeof exception === 'object' && exception.stack) {
    return String(exception.stack);
  }
  return '';
}

function isExpectedExternalError(exception: any): boolean {
  if (!exception) return false;
  if (exception.name === 'AbortError') return true;

  // PostgreSQL query/server errors carry a 5-char SQLSTATE code or severity.
  if (typeof exception === 'object') {
    if (typeof exception.code === 'string' && /^[0-9A-Z]{5}$/.test(exception.code)) {
      return true;
    }
    if (typeof exception.severity === 'string' && exception.severity.length > 0) {
      return true;
    }
  }

  const msg = getErrorMessage(exception);
  return IGNORED_ERROR_MESSAGES.some((pattern) => msg.includes(pattern));
}

function shouldPrompt(exception: any, showError: boolean): boolean {
  if (!showError || !exception) return false;
  return !isExpectedExternalError(exception);
}

function getSignature(message: string, stack: string): string {
  const firstFrame = stack
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('at ')) || '';
  return `${message}::${firstFrame}`;
}

function getAppVersion(): string {
  try {
    const electron = require('@electron/remote');
    return electron?.app?.getVersion?.() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getPlatformInfo(): string {
  const sysInfo = typeof window !== 'undefined' ? (window as any).__postbirdSystemInfo : null;
  if (sysInfo && sysInfo.platform) {
    const osName = sysInfo.platform === 'darwin' ? 'macOS' : sysInfo.platform === 'win32' ? 'Windows' : sysInfo.platform;
    const ver = sysInfo.osVersion || sysInfo.release || '';
    const arch = sysInfo.arch ? ` (${sysInfo.arch})` : '';
    return `${osName}${ver ? ` ${ver}` : ''}${arch}`;
  }
  const parts: string[] = [];
  if (typeof process !== 'undefined') {
    if (process.platform) parts.push(process.platform);
    if (process.arch) parts.push(process.arch);
  } else if (typeof navigator !== 'undefined' && navigator.platform) {
    parts.push(navigator.platform);
  }
  return parts.join(' / ') || 'unknown';
}

function getPgVersions(): string {
  try {
    const Conn = (global as any).Connection;
    if (Conn && Array.isArray(Conn.instances)) {
      const versions = Conn.instances
        .map((i: any) => i?._serverVersion)
        .filter(Boolean);
      return versions.join(', ');
    }
  } catch {
    // ignore
  }
  return '';
}

function buildReport(exception: any) {
  const rawMessage = getErrorMessage(exception);
  const rawStack = getErrorStack(exception);
  const message = sanitizeText(rawMessage);
  const stack = sanitizeText(rawStack);
  const version = getAppVersion();
  const platform = getPlatformInfo();
  const pgVersion = getPgVersions();

  const metaLines = [
    `Postbird: ${version}`,
    `Platform: ${platform}`,
  ];
  if (pgVersion) {
    metaLines.push(`PostgreSQL: ${pgVersion}`);
  }
  try {
    const appTab = (global as any).App?.currentTab;
    if (appTab?.name) {
      metaLines.push(`View: ${appTab.name}${appTab.instance?.currentTab ? ` / ${appTab.instance.currentTab}` : ''}`);
    }
  } catch {
    // ignore
  }

  const reportSections = [
    `Error: ${message}`,
    '',
    metaLines.join('\n'),
  ];
  if (stack) {
    reportSections.push('', 'Stack trace:', stack);
  }
  const reportText = reportSections.join('\n');

  const shortMsg = message.split('\n')[0].slice(0, 100);
  const title = `Bug: ${shortMsg}`;

  const githubBody = [
    '### Description',
    '<!-- Please describe what you were doing when this error occurred -->',
    '',
    '### Error Details',
    '```',
    reportText.slice(0, 3500),
    '```',
  ].join('\n');
  const githubUrl = `${GITHUB_ISSUES_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(githubBody)}`;

  // Keep mailto: body concise to stay within OS/mail-client URL length limits.
  const shortStack = stack ? stack.split('\n').slice(0, 12).join('\n') : '';
  const emailBody = [
    'Please describe what you were doing when this error occurred:',
    '',
    '---',
    `Error: ${message}`,
    metaLines.join('\n'),
    shortStack ? `\nStack trace:\n${shortStack}` : '',
  ]
    .join('\n')
    .slice(0, 1400);
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[Postbird ${version}] ${shortMsg}`)}&body=${encodeURIComponent(emailBody)}`;

  return {
    title,
    reportText,
    githubUrl,
    mailtoUrl,
  };
}

function logLocally(exception: any) {
  const msg = getErrorMessage(exception);
  const stack = getErrorStack(exception);
  if ((global as any).logger) {
    (global as any).logger.error('error: ', colors.red(msg));
    if (stack) (global as any).logger.info(stack);
  } else {
    console.error('error: ', exception);
    if (stack) console.error(stack);
  }
}

var errorReporter: any = function errorReporter(exception: any, showError = true) {
  logLocally(exception);

  if (!shouldPrompt(exception, showError)) {
    return false;
  }

  if (typeof document === 'undefined' || isPromptOpen) {
    return false;
  }

  const payload = buildReport(exception);
  const sig = getSignature(getErrorMessage(exception), getErrorStack(exception));
  if (seenSignatures.has(sig)) {
    return false;
  }
  seenSignatures.add(sig);

  try {
    const DialogRef = (global as any).Dialog;
    if (DialogRef && typeof DialogRef.ErrorReport === 'function') {
      isPromptOpen = true;
      new DialogRef.ErrorReport(payload, () => {
        isPromptOpen = false;
      });
    } else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(payload.reportText);
    }
  } catch (e) {
    isPromptOpen = false;
    console.log('can not show error', e);
  }

  return false;
};

errorReporter.init = () => {};
errorReporter.shouldPrompt = shouldPrompt;
errorReporter.buildReport = buildReport;
errorReporter.sanitizeText = sanitizeText;
errorReporter.resetSeen = () => {
  seenSignatures.clear();
  isPromptOpen = false;
};

if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('uncaughtException', (err) => errorReporter(err, true));
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !(window as any).__postbirdErrorListenersAttached) {
  (window as any).__postbirdErrorListenersAttached = true;
  window.addEventListener('error', (event: ErrorEvent) => {
    errorReporter(event.error || event.message, true);
  });
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    errorReporter(event.reason || 'Unhandled promise rejection', true);
  });
}

module.exports = errorReporter;
