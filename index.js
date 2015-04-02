#!/usr/bin/env node

var program = require('commander');
var userArgs = process.argv.splice(2);
var message = userArgs.join(' ');
var confluenceUrl = process.env.CONFLUENCE_URL

if (message.length > 140) {
  console.log('Message was too long. Can only be 140 characters. It was: ', message.length);
  process.exit(1);
}

if (!confluenceUrl) {
  console.log('Please set the environment variable CONFLUENCE_URL.')
  process.exit(2);
}

console.log(message);
