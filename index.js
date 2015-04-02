#!/usr/bin/env node

var program = require('commander');
var url = require('url');

var userArgs = process.argv.splice(2);
var message = userArgs.join(' ');
var confluenceUrl = process.env.CONFLUENCE_URL;
var confluenceUser = process.env.CONFLUENCE_USER;
var keychain = require('keychain');

if (message.length > 140) {
  console.log('Message was too long. Can only be 140 characters. It was: ', message.length);
  process.exit(1);
}

if (!confluenceUrl) {
  console.log('Please set the environment variable CONFLUENCE_URL.')
  process.exit(2);
}

if (!confluenceUser) {
  console.log('Please set the environment variable CONFLUENCE_USER.')
  process.exit(3);
}

keychain.getPassword({account: confluenceUser, service: url.parse(confluenceUrl).host, type: 'internet'}, function (err, pass) {
  console.log('Password is', pass);
});

console.log(message);
