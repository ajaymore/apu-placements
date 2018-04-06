var google = require('googleapis');
const fs = require('fs');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Multer = require('multer');
const uploader = require('./uploader-transpiled');
const Busboy = require('busboy');
const getRawBody = require('raw-body');

var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'secrets.json';

admin.initializeApp(functions.config().firebase);

const today = new Date();
let year;
if (today.getMonth() > 4) {
  year = `${today.getFullYear()}-${today.getFullYear() + 1}`;
} else {
  year = `${today.getFullYear() - 1}-${today.getFullYear()}`;
}

const authorize = () => {
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

const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const app = express();
var bodyParser = require('body-parser');
app.use(cookieParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors);
app.use((req, res, next) => {
  if (
    req.rawBody === undefined &&
    req.method === 'POST' &&
    req.headers['content-type'].startsWith('multipart/form-data')
  ) {
    getRawBody(
      req,
      {
        length: req.headers['content-length'],
        limit: '10mb',
        encoding: contentType.parse(req).parameters.charset
      },
      function(err, string) {
        if (err) return next(err);
        req.rawBody = string;
        next();
      }
    );
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (
    req.method === 'POST' &&
    req.headers['content-type'].startsWith('multipart/form-data')
  ) {
    const busboy = new Busboy({ headers: req.headers });
    let fileBuffer = new Buffer('');
    req.files = {
      file: []
    };

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', data => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });

      file.on('end', () => {
        const file_object = {
          fieldname,
          originalname: filename,
          encoding,
          mimetype,
          buffer: fileBuffer
        };

        req.files.file.push(file_object);
      });
    });

    busboy.on('field', function(
      fieldname,
      val,
      fieldnameTruncated,
      valTruncated
    ) {
      req.uploadInfo = val;
    });

    busboy.on('finish', function() {
      next();
    });

    busboy.end(req.rawBody);
    req.pipe(busboy);
  } else {
    next();
  }
});

const multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 2 * 1024 * 1024
});

app.post('/image-upload', uploader.uploadToGDrive, function(req, res, next) {
  res.send({ status: 'Done!' });
});

exports.app = functions.https.onRequest(app);

exports.createGdriveDir = functions.database
  .ref('/placements/' + year + '/uploads/{pushId}')
  .onCreate(event => {
    const newEntry = event.data.val();
    return authorize.auth().then(auth => {
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
