var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'secrets.json';
const PARENT_ID = '0B7pV8AthJ47_SnJhOWlyMmxUZ00';
const admin = require('firebase-admin');

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

let uploader = {};

const today = new Date();
let year;
if (today.getMonth() > 4) {
  year = `${today.getFullYear()}-${today.getFullYear() + 1}`;
} else {
  year = `${today.getFullYear() - 1}-${today.getFullYear()}`;
}

const getFolderIdOrCreate = (drive, folderName) => {
  return new Promise((resolve, reject) => {
    drive.files.list(
      {
        q: `'${PARENT_ID}' in parents and name = '${folderName}' and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive'
      },
      function(err, response) {
        console.log('== drive search', err, response);
        if (err) {
          reject(err);
        }
        var files = response.files;
        if (!files.length) {
          drive.files.create(
            {
              resource: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [PARENT_ID]
              },
              fields: 'id'
            },
            function(err, file) {
              if (err) {
                reject(err);
              } else {
                resolve(file.id);
              }
            }
          );
        } else {
          resolve(files[0].id);
        }
      }
    );
  });
};

const getFileIdIfExists = (drive, fileName, folderId) => {
  return new Promise((resolve, reject) => {
    drive.files.list(
      {
        q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive'
      },
      function(err, response) {
        if (err) {
          reject(err);
        }
        var files = response.files;
        if (!files.length) {
          resolve(false);
        } else {
          resolve(files[0].id);
        }
      }
    );
  });
};

const createNewFile = (drive, file, folderId, fileName) => {
  console.log('=== creating with', fileName, folderId);
  return new Promise((resolve, reject) => {
    drive.files.create(
      {
        resource: {
          name: fileName,
          mimeType: file.mimetype,
          parents: [folderId]
        },
        media: {
          mimeType: file.mimetype,
          body: file.buffer // read streams are awesome!
        },
        fields: 'id'
      },
      (err, file) => {
        if (err) reject(err);
        resolve(file.id);
      }
    );
  });
};

const updateFileWithNewData = (drive, fileId, file, folderId, fileName) => {
  console.log('=== updating with', fileId, fileName);
  return new Promise((resolve, reject) => {
    drive.files.update(
      {
        fileId: fileId,
        resource: {
          name: fileName,
          mimeType: file.mimetype
        },
        media: {
          mimeType: file.mimetype,
          body: file.buffer // read streams are awesome!
        },
        fields: 'id'
      },
      (err, file) => {
        if (err) reject(err);
        resolve(fileId);
      }
    );
  });
};

uploader.uploadToGDrive = (req, res, next) => {
  if (!req.files.file) return next();

  const uploadInfo = JSON.parse(req.uploadInfo);
  console.log(uploadInfo);
  authorize().then(oauth2Client => {
    var drive = google.drive({ version: 'v3', auth: oauth2Client });
    const folderName = uploadInfo.folderName;
    const file = req.files.file[0];
    const email = uploadInfo.user.email;
    const fileName =
      email.substr(0, email.length - 11) +
      '_resume' +
      file.originalname.substr(file.originalname.lastIndexOf('.'));
    console.log('==== begin With', fileName);
    getFolderIdOrCreate(drive, folderName).then(folderId => {
      console.log(folderId);
      getFileIdIfExists(drive, fileName, folderId).then(fileId => {
        console.log('=== finding file', fileId);
        if (fileId) {
          updateFileWithNewData(drive, fileId, file, folderId, fileName).then(
            update => {
              admin
                .database()
                .ref('placements')
                .child(year)
                .child('my-activity')
                .child(uploadInfo.user.apu.uid)
                .push({
                  data: JSON.stringify({
                    user: uploadInfo.user.email,
                    fileName,
                    folderName,
                    dateVal: new Date(),
                    author: uploadInfo.user.email
                  })
                })
                .then(() => {
                  next();
                });
            }
          );
        } else {
          createNewFile(drive, file, folderId, fileName).then(newFile => {
            console.log(newFile);
            admin
              .database()
              .ref('placements')
              .child(year)
              .child('my-activity')
              .child(uploadInfo.user.apu.uid)
              .push({
                data: JSON.stringify({
                  user: uploadInfo.user.email,
                  fileName,
                  folderName,
                  dateVal: new Date(),
                  author: uploadInfo.user.email
                })
              })
              .then(() => {
                next();
              });
          });
        }
      });
    });
  });
};

module.exports = uploader;
