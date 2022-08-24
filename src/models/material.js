const { mongoose } = require('./../config/database');


const MaterialSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  {
    collection: 'materials',
    timestamps: true,
    versionKey: false, 
  }
);


module.exports = mongoose.model('Material', MaterialSchema);