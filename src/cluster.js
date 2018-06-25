'use strict';

// Dependencies
const Config = require('./libraries/config');
const App = require('./app.js');
const Cluster = require('cluster');

/**
 * Launch a cluster of n app.js workers
 */
class ClusterApp {
    constructor() {
        // Set config
        this.config = new Config(`${__dirname}/..`).getValue('app');

        // Debug flag
        this.debug = process.execArgv.indexOf('--debug') !== -1;
    }
    start() {
        // Switch following thread type
        if (Cluster.isMaster) {
            this.createWorkers();
        } else {
            this.startWorker(Cluster.worker.id);
        }
    }
    createWorkers() {
        // Star a worker for each core
        for (let i = 0; i < this.config.cores; i += 1) {
            Cluster.fork();
        }

        // On worker exit, start another
        Cluster.on('exit', function() {
            Cluster.fork();
        });
    }
    startWorker(id) {
        if (this.debug) {
            process._debugPort = `5858${id}`;
        }
        new App(id, this.config.host, this.config.port).start();
    }
}

let clusterApp = new ClusterApp();
clusterApp.start();
