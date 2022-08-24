/** @format */

const { mongoose } = require('../config/database');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const OrderSchema = new mongoose.Schema(
  {
    number: { type: Number },
    order_id: { type: String },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    payment_status: { type: String, default: 'Pending' },
    payment_method: { type: String, default: 'Cash' },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    collection: 'orders',
    timestamps: true,
    versionKey: false,
  }
);

OrderSchema.plugin(AutoIncrement, {
  id: 'order_seq',
  inc_field: 'number',
});
module.exports = mongoose.model('Order', OrderSchema);
