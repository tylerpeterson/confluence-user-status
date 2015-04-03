#!/usr/bin/env node

var url = require('url');
var debug = require('debug')('cuss');
var phantom = require('phantom');

var userArgs = process.argv.splice(2);
var message = userArgs.join(' ');
var confluenceUrl = process.env.CONFLUENCE_URL;
var confluenceUser = process.env.CONFLUENCE_USER;
var confluencePassword;
var keychain = require('keychain');

if (message.length > 140) {
  console.log('Message was too long. Can only be 140 characters. It was: ', message.length);
  process.exit(1);
} else {
  debug('Message good');
}

if (!confluenceUrl) {
  console.log('Please set the environment variable CONFLUENCE_URL.')
  process.exit(2);
} else {
  debug('Confluence URL good:', confluenceUrl);
}

if (!confluenceUser) {
  console.log('Please set the environment variable CONFLUENCE_USER.')
  process.exit(3);
} else {
  debug('Confluence user good:', confluenceUser);
}

debug('Accessing keychain.');
keychain.getPassword({account: confluenceUser, service: url.parse(confluenceUrl).host, type: 'internet'}, function (err, pass) {
  debug('Have password from keychain');
  confluencePassword = pass;

  phantom.create(function (ph) {
    debug('Phantom created');
    ph.createPage(function (page) {
      debug('Page created');
      page.set('viewportSize', {width: 1024, height: 768});
      page.open(confluenceUrl, function (status) {
        debug('opened confluence', status);
        page.evaluate(function (confluenceUser, confluencePassword) {
          $('#os_username').val(confluenceUser);
          $('#os_password').val(confluencePassword);
          $('#loginButton').click();
        }, function () {
          page.set('onLoadFinished', function () {
            debug('Logged in.');
            page.evaluate(function (message) {
              $('#user-menu-link').click();
              $('#create-user-status-link').click();
              if (message) {
                $('#status-text').val(message);
                $('.status-update-button').click();
              }
            }, function () {
              debug('Finished with update dialog.');
              if (!message) {
                // For some reason can't get reading of the old status message to work in PhantomJS
                // in the meantime snap a picture when no message is set.
                setTimeout(function () {
                  debug('Snapping picture');
                  page.render('snap.png', function () {
                    ph.exit();          
                  });
                }, 30);
              }
            }, message);
          })
        }, confluenceUser, confluencePassword);

      });
    });
  });
});
