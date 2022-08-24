const { mongoose } = require('../config/database');

const fileSchema = new mongoose.Schema(
  {
    originalname: { type: String, required: true },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
  },
  {
    collection: 'files',
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('File', fileSchema);
