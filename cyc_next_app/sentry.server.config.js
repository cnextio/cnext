const Sentry = require("@sentry/nextjs");

Sentry.init({
    dsn: "https://ae2ea08ad87b4d8e99ddd744438a2739@o1238555.ingest.sentry.io/6389364",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
});
