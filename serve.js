#!/usr/bin/env node
const couchbase = require("couchbase");
const uuid = require("uuid");
const config = require("config");
const bunyan = require("bunyan");
const fastify = require("fastify")();
const _ = require("lodash");

const N1qlQuery = couchbase.N1qlQuery;
const cluster = new couchbase.Cluster(`couchbase://${config.couchbase.host}`);


const bucket = cluster.openBucket(config.couchbase.bucket);
const log = bunyan.createLogger({ name: "analtics" });

fastify.post("/", (request, reply) => {
    const timestamp = (new Date()).toISOString();

    bucket.upsert(`${timestamp}:${uuid.v4()}`, { timestamp, body: request.body }, function(err) {
        if(err) {
            log.error(err);
            return reply.code(500).send();
        }

        reply.send({ ok: true });
    });
});

const pagesQuery = N1qlQuery.fromString("SELECT body.url, count(*) FROM analtics WHERE (timestamp BETWEEN $1 AND $2) GROUP BY body.url");
fastify.get("/apiv0/stats/pages", (request, reply) => {
    const start = request.query.start || "0";
    const end = request.query.end || "9";
    bucket.query(pagesQuery, [start, end], (err, results) => {
        if(err) {
            log.error(err);
            return reply.code(500).send();
        }
        reply.send(results);
    });
});

const sessionsQuery = N1qlQuery.fromString("SELECT body.sessionId, count(*) FROM analtics WHERE (timestamp BETWEEN $1 AND $2) GROUP BY body.sessionId");
fastify.get("/apiv0/stats/sessions", (request, reply) => {
    const start = request.query.start || "0";
    const end = request.query.end || "9";
    bucket.query(sessionsQuery, [start, end], (err, results) => {
        if(err) {
            log.error(err);
            return reply.code(500).send();
        }
        reply.send(results);
    });
});

const userQuery = N1qlQuery.fromString("SELECT body.userId, count(*) FROM analtics WHERE (timestamp BETWEEN $1 AND $2) GROUP BY body.userId");
fastify.get("/apiv0/stats/users", (request, reply) => {
    const start = request.query.start || "0";
    const end = request.query.end || "9";
    bucket.query(userQuery, [start, end], (err, results) => {
        if(err) {
            log.error(err);
            return reply.code(500).send();
        }
        reply.send(results);
    });
});
