require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
var google = require('googleapis');
const googleAuth = require('google-auth-library');

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];
const TOKEN_PATH = './credentials.json';

function authorize(callback) {
  var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  var clientId = process.env.GOOGLE_CLIENT_ID;
  var redirectUrl = process.env.GOOGLE_REDIRECT_URL;
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function completeAuth(auth) {
  console.log(auth);
}

authorize(completeAuth);
