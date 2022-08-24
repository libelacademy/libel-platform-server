const { File } = require('../models');
const { error, success } = require('../helpers/responses');
const { uploadFile, downloadFile, deleteFile } = require('../libs/storage');


const download = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) {
      return error(res, 'El archivo no existe.', 404);
    }
    const result = await downloadFile(res, file.fileName);

    if (result.success) {
      return res.end();
    }

    return error(res, result.error);

  } catch (e) {
    error(res, e.message);
  }
}


const upload = async (req, res) => {
  try {
    const result = await uploadFile(req.file);
    if (result.success) {
      const file = await File.create({
        originalname: result.originalname,
        fileName: result.fileName,
        url: result.url,
      });
      return success(res, file, 'Archivo subido correctamente.', 201);
    }
    return error(res, result.error);
    
  } catch (e) {
    error(res, e.message);
  }
}


const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) {
      return error(res, 'El archivo no existe.', 404);
    }
    const result = await deleteFile(file.fileName);
    if (result.success) {
      await file.remove();
      return success(res, file, 'Archivo eliminado correctamente.', 200);
    }
    return error(res, result.error);
  } catch (e) {
    error(res, e.message);
  }
}


const getByUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const file = await File.findOne({ url });
    if (!file) {
      return error(res, 'El archivo no existe.', 404);
    }
    return success(res, file, 'Archivo encontrado correctamente.', 200);
  } catch (e) {
    error(res, e.message);
  }
}


module.exports = {
  getByUrl,
  download,
  upload,
  remove,
};