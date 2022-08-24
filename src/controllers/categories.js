/** @format */

const { Category, File } = require('../models');
const { error, success } = require('../helpers/responses');
const { deleteFile } = require('../libs/storage');

const getAll = async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate({
        path: 'courses',
        populate: {
          path: 'reviews',
        },
      })
      .populate({
        path: 'courses',
        populate: {
          path: 'instructor',
          populate: {
            path: 'user',
          },
        },
      });
    return success(
      res,
      categories,
      'Categorías obtenidas correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    return success(
      res,
      category,
      'Categoría obtenida correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const create = async (req, res) => {
  try {
    const { name, image } = req.body;
    const category = await Category.create({ name, image });
    return success(
      res,
      category,
      'Categoría creada correctamente.',
      201
    );
  } catch (e) {
    error(res, e.message);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, image },
      { new: true }
    );
    return success(
      res,
      category,
      'Categoría actualizada correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return error(res, 'La categoría no existe.', 404);
    }
    if (category.courses.length > 0) {
      return error(
        res,
        'La categoría no puede ser eliminada porque tiene cursos asociados.',
        400
      );
    }
    const file = await File.findOne({ url: category.image });
    console.log(file);
    if (file) {
      const fileRemoved = await deleteFile(file.fileName);
      if (fileRemoved.success) {
        await file.remove();
      }
    }

    await category.remove();
    return success(
      res,
      category,
      'Categoría eliminada correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
