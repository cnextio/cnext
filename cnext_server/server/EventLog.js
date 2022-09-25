const request = require("request");

function eventLog() {
    const LAUNCH = 3600;
    const AFTER_5_MIN = 300000;
    const AFTER_30_MIN = 1800000;

    if (process.env.NODE_ENV != "development") {
        sendEventTrackingAfter(LAUNCH, "launch");
        sendEventTrackingAfter(AFTER_5_MIN, "launch_after_5_min");
        sendEventTrackingAfter(AFTER_30_MIN, "launch_after_30_min");
    }
}

function sendEventTrackingAfter(timeout, tag) {
    setTimeout(() => {
        const loggly_url =
            "http://logs-01.loggly.com/inputs/c58f8bb2-2332-4915-b9f3-70c1975956bb/tag/" + tag;
        request.post(
            loggly_url,
            { json: { time: new Date().toUTCString() } },
            function (error, response) {
                if (!error && response.statusCode == 200) {
                    // console.log("send to loggly", body);
                }
            }
        );
    }, timeout);
}

module.exports = { eventLog };
