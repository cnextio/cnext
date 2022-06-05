const Sentry = require("@sentry/nextjs");

Sentry.init({
    dsn: "https://25a5df08f7ea47be8a9922441cba00d1@o1259763.ingest.sentry.io/6435278",
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 0.1,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
});
