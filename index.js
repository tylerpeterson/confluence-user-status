#!/usr/bin/env node

var program = require('commander');
var userArgs = process.argv.splice(2);
var message = userArgs.join(' ');

if (message.length > 140) {
  console.log('Message was too long. Can only be 140 characters. It was: ', message.length);
  process.exit(1);
}

console.log(message);
