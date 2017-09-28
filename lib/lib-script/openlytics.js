(function() {
    var projectId = "{{ & projectId }}";
    var userId = Math.round(Math.random() * 10000000000); // TODO: Make this deterministic based on user agent + ip or something, but still anonymous

    document.openlytics = {
        pageview: function() {
            var url = location.href;
            var host = location.host;
            var path = location.pathname;

            // Send data to openlytics
            var req = new XMLHttpRequest();
            req.open("POST", "{{ & openlyticsUrl }}/");
            req.setRequestHeader("Content-Type", "application/json");
            req.onreadystatechange = function() {
                if(req.readyState != 4) {
                    return;
                }
                if(req.status != 200) {
                    return console.debug("openlytics data transfer failed", {
                        trace: new Error("Error response from server on request"),
                        status: req.statusText,
                        responseType: req.responseType,
                        response: req.response
                    });
                }
            };
            req.send(JSON.stringify({
                projectId: projectId,
                userId: userId,
                url: url,
                host: host,
                path: path
            }));
        }
    }
})();
