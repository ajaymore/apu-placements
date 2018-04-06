var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'secrets.json';
const PARENT_ID = '0B7pV8AthJ47_SnJhOWlyMmxUZ00';
const authorize = require('./authorize');
const admin = require('firebase-admin');

let uploader = {};

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
        q: `name = '${folderName}' and trashed = false and mimeType = 'application/vnd.google-apps.folder'
        `,
        fields: 'nextPageToken, files(id, name)',
        parents: [PARENT_ID],
        spaces: 'drive'
      },
      function(err, response) {
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
        q: `name = '${fileName}' and trashed = false`,
        fields: 'nextPageToken, files(id, name)',
        parents: [folderId],
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

const updateFileWithNewData = (drive, fileId, file, folderId) => {
  return new Promise((resolve, reject) => {
    drive.files.update(
      {
        fileId: fileId,
        resource: {
          name: file.originalname,
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

uploader.uploadToGDrive = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uploadInfo = JSON.parse(req.body.uploadInfo);
    const oauth2Client = await authorize();
    var drive = google.drive({ version: 'v3', auth: oauth2Client });
    // const folderName = uploadInfo.folderName;
    const folderName = 'Test Folder';
    const email = uploadInfo.user.email;
    const fileName =
      email.substr(0, email.length - 11) +
      '_resume' +
      req.file.originalname.substr(req.file.originalname.lastIndexOf('.'));
    const folderId = await getFolderIdOrCreate(drive, folderName);
    const fileId = await getFileIdIfExists(drive, fileName, folderId);

    if (fileId) {
      const update = await updateFileWithNewData(
        drive,
        fileId,
        req.file,
        folderId
      );
    } else {
      const newFile = await createNewFile(drive, req.file, folderId, fileName);
    }
    admin
      .database()
      .ref('placements')
      .child(year)
      .child('my-activity')
      .child(uploadInfo.user.apu.uid)
      .push({
        data: {
          user: uploadInfo.user.email,
          fileName,
          folderName,
          dateVal: new Date(),
          author: uploadInfo.user.email
        }
      })
      .then(() => {
        next();
      });
  } catch (err) {
    console.log(err);
    res.status(500).send('error');
  }
};

module.exports = uploader;
