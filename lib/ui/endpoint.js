const fs = require("fs");
const path = require("path");
const uiPrototype = fs.readFileSync(path.join(__dirname, "ui-prototype.html"), "utf8");

module.exports = (request, reply) => reply.type("text/html").send(uiPrototype);
