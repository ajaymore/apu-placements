var express = require('express');
var router = express.Router();
const Multer = require('multer');
const uploader = require('../uploader');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 2 * 1024 * 1024
});

// the multer accessing the key 'image', as defined in the `FormData` object on the front end
// Passing the uploadToGcs function as middleware to handle the uploading of request.file
router.post(
  '/image-upload',
  multer.single('doc'),
  uploader.uploadToGDrive,
  function(req, res, next) {
    res.send({ status: 'Done!' });
  }
);

module.exports = router;
