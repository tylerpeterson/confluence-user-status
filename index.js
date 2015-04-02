#!/usr/bin/env node

var program = require('commander');
var userArgs = process.argv.splice(2);

console.log(userArgs.join(' '));
