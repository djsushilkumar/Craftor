#!/usr/bin/env node
const { McpServerDaemon } = require('../dist/index.js');

const args = process.argv.slice(2);
let site = '';
let token = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--site' && args[i + 1]) {
    site = args[i + 1];
  }
  if (args[i] === '--token' && args[i + 1]) {
    token = args[i + 1];
  }
}

const daemon = new McpServerDaemon(site, token);
daemon.startStdio();
