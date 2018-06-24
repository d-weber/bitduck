"use strict";

// Dependencies
const config = require("./libraries/config");
const app = require("./app.js");
const cluster = require('cluster');

/**
 * Launch a cluster of n app.js workers
 */
class Cluster {
    constructor() {
        // Set config
        config.setRootPath(__dirname + "/..");
        this.config = config.getValue("app");

        // Debug flag
        this.debug = process.execArgv.indexOf("--debug") !== -1;

        // Switch following thread type
        if (cluster.isMaster) {
            this.createWorkers();
        } else {
            this.startWorker(cluster.worker.id);
        }
    }
    createWorkers(){
        // Star a worker for each core
        for (let i = 0; i < this.config.cores; i += 1) {
            cluster.fork();
        }

        // On worker exit, start another
        cluster.on("exit", function() {
            cluster.fork();
        });
    }
    startWorker(id){
        if (this.debug) {
            process._debugPort = `5858${id}`;
        }
        new app(id, this.config.host, this.config.port).start();
    }
}

new Cluster();


