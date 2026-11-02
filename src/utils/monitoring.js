// Error monitoring with Sentry. Off unless VITE_SENTRY_DSN is set at build time, so local
// development and tests send nothing. Sentry is loaded only when it is on, keeping it out of
// the main bundle otherwise.
const dsn = import.meta.env.VITE_SENTRY_DSN;
let sentry = null;

export const initMonitoring = async () => {
    if (!dsn || import.meta.env.MODE === "test") return;
    sentry = await import("@sentry/react");
    sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        tracesSampleRate: 0.1,
        // Messages, posts and form inputs never leave the browser in error reports
        sendDefaultPii: false,
    });
};

/**
 * Reports an error (e.g. a page crash caught by ErrorBoundary). Does nothing when monitoring is off.
 * @param {unknown} error
 * @param {Record<string, unknown>} [context]
 */
export const reportError = (error, context) => {
    sentry?.captureException(error, context ? { extra: context } : undefined);
};
