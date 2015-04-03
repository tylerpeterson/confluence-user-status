#!/usr/bin/env node

// This version uses zombieJS instead of PhantomJS and I couldn't quite get it to work.
// Eventually make it work or delete it.

var program = require('commander');
var url = require('url');
var debug = require('debug')('cuss');

var userArgs = process.argv.splice(2);
var message = userArgs.join(' ');
var confluenceUrl = process.env.CONFLUENCE_URL;
var confluenceUser = process.env.CONFLUENCE_USER;
var confluencePassword;
var keychain = require('keychain');
var Browser = require('zombie');

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
  confluencePassword = pass;
  var browser = new Browser({maxWait: 30000, silent: true});
  browser
    .visit(confluenceUrl)
    .then(null, function (err) {
      debug('Error visiting the url.');
    })
    .then(function () {
    browser
      .fill('#os_username', confluenceUser)
      .fill('#os_password', confluencePassword)
      .pressButton('#loginButton', function () {
        browser.assert.success();
        debug('logged in');
        browser.click('#user-menu-link').then(function () {
          browser.assert.success();
          debug('user menu showing');
          browser.click('#create-user-status-link')
            .then(null, function (err) {
              debug('error displaing status dialog');
            })
            .then(function () {
              browser.wait(textareaLoaded, null).then(function () {
                browser.assert.success();
                debug('new status dialog showing');
                var oldStatus = browser.text('span.status-text');
                console.log("Old Status:", oldStatus);
                if (!message) {
                  debug('No new message.')
                } else {
                  debug('Setting new message.', message);
                  browser
                    .wait(textareaLoaded, null).then(function () {
                        browser.fill('#status-text', message)
                          .pressButton('.status-update-button').then(function () {
                              browser.assert.success();
                              debug('New message set.');                      
                          });                
                    });
                }
                
              });
            });
        });
      });
  });
});

function textareaLoaded(window) {
  var found = !!window.document.querySelector('#status-text')
  debug('waiting for textarea... found?', found);
  return found;
}
