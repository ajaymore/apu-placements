var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'secrets.json';
const PARENT_ID = '1B-8tAIRMOUK2amPKJcTsfh8HvrWqPb_7';

const authorize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('client_secret.json', (err, content) => {
      if (err) reject(err);
      resolve(content);
    });
  });
};

const getToken = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

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

const createNewFile = (drive, file, folderId) => {
  return new Promise((resolve, reject) => {
    drive.files.create(
      {
        resource: {
          name: file.originalname,
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

const test = async () => {
  try {
    const content = await authorize();
    const credentials = JSON.parse(content);
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    const token = await getToken();
    oauth2Client.credentials = JSON.parse(token);
    var drive = google.drive({ version: 'v3', auth: oauth2Client });
    const folderName = 'Test Folder';
    const fileName = 'Work for a lifetime.docx';
    const folderId = await getFolderIdOrCreate(drive, folderName);
    const fileId = await getFileIdIfExists(drive, fileName, folderId);

    if (fileId) {
      const update = await updateFileWithNewData(drive, fileId, file, folderId);
    } else {
      const newFile = await createNewFile(drive, file, folderId);
    }
  } catch (err) {
    console.log(err);
  }
};

test();
