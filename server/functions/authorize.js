var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'secrets.json';

let authorize = {};
authorize.auth = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('client_secret.json', (err, content) => {
      if (err) reject(err);

      const credentials = JSON.parse(content);
      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      var auth = new googleAuth();
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) reject(err);
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      });
    });
  });
};

module.export = authorize;
