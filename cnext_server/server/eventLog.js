const request = require("request");

function eventLog() {
    const AFTER_1_MIN = 60000;
    const AFTER_5_MINS = 300000;
    const AFTER_30_MINS = 1800000;

    sendEventTrackingAfter(AFTER_1_MIN, "launch_after_1_min");
    sendEventTrackingAfter(AFTER_5_MINS, "launch_after_5_mins");
    setInterval(() => {
        sendEventTrackingAfter(0, "launch_after_30_mins");
    }, AFTER_30_MINS);
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
