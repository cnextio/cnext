const Sentry = require("@sentry/nextjs");

Sentry.init({
    dsn: "https://ae2ea08ad87b4d8e99ddd744438a2739@o1238555.ingest.sentry.io/6389364",
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 0.1,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
});
