
const { Storage } = require('@google-cloud/storage');
const uuid = require('uuid');
const path = require('path');
const { Readable } = require('stream');
const { google } = require('../config');

const storage = new Storage({
  projectId: google.projectId,
  keyFilename: path.join(__dirname, '../config/credentials.json'),
});


const bucket = storage.bucket(google.bucketName);


const uploadFile = async (file) => {
  const ext = path.extname(file.originalname);
  const fileName = `${uuid.v4()}${ext}`;
  const cloudFile = bucket.file(fileName);
  const stream = Readable.from(file.buffer);

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        cloudFile.createWriteStream().on('finish', () => {
          resolve({
            success: true,
            originalname: file.originalname,
            fileName,
            url:
              'https://storage.googleapis.com/' +
              google.bucketName +
              '/' +
              fileName,
          });
        })
      )
      .on('error', (err) => {
        reject({
          success: false,
          error: err,
        });
      });
  });
};


const downloadFile = async (res, fileName) => {
  const cloudFile = bucket.file(fileName);
  // const stream = Readable.from(file.buffer);
  const stream = cloudFile.createReadStream();

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject({
        success: false,
        error: err,
      });
    }
    );

    stream.pipe(res);

    stream.on('end', () => {
      resolve({
        success: true,
      });
    })
  })
}


const deleteFile = async (fileName) => {
  const cloudFile = bucket.file(fileName);
  try {
    await cloudFile.delete();
    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: err,
    };
  }
}


module.exports = {
  uploadFile,
  downloadFile,
  deleteFile,
};