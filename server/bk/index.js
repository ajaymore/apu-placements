var google = require('googleapis');
const fs = require('fs');
const functions = require('firebase-functions');
const authorize = require('./authorize');
const admin = require('firebase-admin');
const Multer = require('multer');
const uploader = require('./uploader');

admin.initializeApp(functions.config().firebase);

const today = new Date();
let year;
if (today.getMonth() > 4) {
  year = `${today.getFullYear()}-${today.getFullYear() + 1}`;
} else {
  year = `${today.getFullYear() - 1}-${today.getFullYear()}`;
}

const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const app = express();
var bodyParser = require('body-parser');
app.use(cookieParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors);

const multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 2 * 1024 * 1024
});

app.post(
  '/image-upload',
  multer.single('doc'),
  uploader.uploadToGDrive,
  function(req, res, next) {
    res.send({ status: 'Done!' });
  }
);

exports.app = functions.https.onRequest(app);

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
