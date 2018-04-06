require('dotenv').config();
const fs = require('fs');
const functions = require('firebase-functions');
var google = require('googleapis');
const googleAuth = require('google-auth-library');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];
const TOKEN_PATH = './credentials.json';

function authorize() {
  var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  var clientId = process.env.GOOGLE_CLIENT_ID;
  var redirectUrl = process.env.GOOGLE_REDIRECT_URL;
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  return new Promise((res, rej) => {
    try {
      fs.readFile(TOKEN_PATH, function(err, token) {
        oauth2Client.credentials = JSON.parse(token);
        res(oauth2Client);
      });
    } catch (err) {
      rej(err);
    }
  });
}

const today = new Date();
let year;
if (today.getMonth() > 4) {
  year = `${today.getFullYear()}-${today.getFullYear() + 1}`;
} else {
  year = `${today.getFullYear() - 1}-${today.getFullYear()}`;
}
exports.createGdriveDir = functions.database
  .ref('/placements/' + year + '/uploads/{pushId}')
  .onCreate(event => {
    const newEntry = event.data.val();
    return authorize().then(auth => {
      var drive = google.drive({ version: 'v3', auth });
      var fileMetadata = {
        name: newEntry.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['0B7pV8AthJ47_SnJhOWlyMmxUZ00']
      };
      drive.files.create(
        {
          resource: fileMetadata,
          fields: 'id'
        },
        function(err, file) {
          if (err) {
            console.log('error creating folder: ', err);
          } else {
            console.log('Folder Id: ', file.id);
          }
        }
      );
    });
  });
