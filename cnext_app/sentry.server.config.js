const Sentry = require("@sentry/nextjs");

Sentry.init({
    dsn: "https://25a5df08f7ea47be8a9922441cba00d1@o1259763.ingest.sentry.io/6435278",
    authToken: "19f6f8e90778487cb1c2333518a47def664d5734769b40ac857e4bede4222f2d",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
});
