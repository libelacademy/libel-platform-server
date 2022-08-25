/** @format */

const { Order } = require('../models');
const { error, success } = require('../helpers/responses');

const getAll = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('student')
      .populate('course')
      .populate({
        path: 'payer',
        model: 'User',
      })
    success(res, orders);
  } catch (e) {
    error(res, e.message);
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('student')
      .populate('course')
      .populate({
        path: 'payer',
        model: 'User',
      })
    success(res, order);
  } catch (e) {
    error(res, e.message);
  }
}


module.exports = {
  getAll,
  getOne,
};