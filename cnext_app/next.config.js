// /** @type {import('next').NextConfig} */
// const { withSentryConfig } = require("@sentry/nextjs");

// const sentryWebpackPluginOptions = {
//     // Additional config options for the Sentry Webpack plugin. Keep in mind that
//     // the following options are set automatically, and overriding them is not
//     // recommended:
//     //   release, url, org, project, authToken, configFile, stripPrefix,
//     //   urlPrefix, include, ignore
//     dsn: "https://25a5df08f7ea47be8a9922441cba00d1@o1259763.ingest.sentry.io/6435278",
//     tracesSampleRate: 0.1,
//     silent: false, // Suppresses all logs
//     // For all available options, see:
//     // https://github.com/getsentry/sentry-webpack-plugin#options.
// };

// moduleExports = {
//     reactStrictMode: true,
//     typescript: {
//         // !! WARN !!
//         // Dangerously allow production builds to successfully complete even if
//         // your project has type errors.
//         // !! WARN !!
//         ignoreBuildErrors: true,
//     },
// };

// module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);

/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
};
