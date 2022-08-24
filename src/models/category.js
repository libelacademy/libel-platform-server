const { mongoose } = require('./../config/database');


const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }],
  },
  {
    collection: 'categories',
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model('Category', CategorySchema);