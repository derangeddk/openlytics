const couchbase = require("couchbase");
const uuid = require("uuid");
const fastify = require("fastify");
const _ = require("lodash");

const Analytics = module.exports = function(log, config) {
    this.log = log;
    this.config = config;

    const N1qlQuery = couchbase.N1qlQuery;
    const cluster = new couchbase.Cluster(`couchbase://${config.couchbase.host}`);
    const manager = cluster.manager();

    manager.listBuckets((error, buckets) => {
        if(error) throw error;
        if(_.find(buckets, (bucket) => bucket.name === "analtics")) {
            return log.info("found bucket");
        }
        manager.createBucket("analtics", { }, (error) => {
            if(error) throw error;
            return log.info("bucket created");
        });
    });

    const bucket = cluster.openBucket(config.couchbase.bucket);

    this.server = fastify();

    this.server.post("/", (request, reply) => {
        const timestamp = (new Date()).toISOString();

        bucket.upsert(`${timestamp}:${uuid.v4()}`, { timestamp, body: request.body }, function(err) {
            if(err) {
                log.error(err);
                return reply.code(500).send();
            }

            reply.send({ ok: true });
        });
    });

    const pagesQuery = N1qlQuery.fromString("SELECT body.url, count(*) AS hits FROM analtics WHERE (timestamp BETWEEN $1 AND $2) GROUP BY body.url");
    this.server.get("/apiv0/stats/pages", (request, reply) => {
        const start = request.query.start || "0";
        const end = request.query.end || "9";
        bucket.query(pagesQuery, [start, end], (err, results) => {
            if(err) {
                log.error(err);
                return reply.code(500).send();
            }

            const data = { };
            results.forEach((r) => data[r.url || "none"] = r.hits);
            reply.send(data);
        });
    });

    const sessionsQuery = N1qlQuery.fromString("SELECT body.sessionId, count(*) AS hits FROM analtics WHERE (timestamp BETWEEN $1 AND $2) GROUP BY body.sessionId");
    this.server.get("/apiv0/stats/sessions", (request, reply) => {
        const start = request.query.start || "0";
        const end = request.query.end || "9";
        bucket.query(sessionsQuery, [start, end], (err, results) => {
            if(err) {
                log.error(err);
                return reply.code(500).send();
            }

            const data = { };
            results.forEach((r) => data[r.sessionId || "none"] = r.hits);
            reply.send(data);
        });
    });

    const userQuery = N1qlQuery.fromString("SELECT body.userId, count(*) AS hits FROM analtics WHERE (timestamp BETWEEN $1 AND $2) GROUP BY body.userId");
    this.server.get("/apiv0/stats/users", (request, reply) => {
        const start = request.query.start || "0";
        const end = request.query.end || "9";
        bucket.query(userQuery, [start, end], (err, results) => {
            if(err) {
                log.error(err);
                return reply.code(500).send();
            }

            const data = { };
            results.forEach((r) => data[r.userId || "none"] = r.hits);
            reply.send(data);
        });
    });
};

Analytics.prototype.start = function(callback) {
    this.server.listen(this.config.port, (error) => {
        if(error) return callback(error);
        this.log.info(`server listening on ${this.server.server.address().port}`);
        callback();
    });
};

Analytics.prototype.stop = function(callback) {
    callback; // avoid eslint error
    throw "TODO implement";
};
