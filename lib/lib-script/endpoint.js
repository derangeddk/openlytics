const mustache = require("mustache");
const fs = require("fs");
const path = require("path");
const scriptTemplate = fs.readFileSync(path.join(__dirname, "openlytics.js"), "utf8");

module.exports = (request, reply) => {
    let script = mustache.render(scriptTemplate, {
        projectId: request.params.projectId,
        openlyticsUrl: `http://${request.req.headers.host}` //TODO: How do I decide if I should use http or https?
    });
    reply.type("text/javascript").send(script);
};
