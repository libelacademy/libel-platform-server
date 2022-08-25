const { mongoose } = require('../config/database');


const CertificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    url: { type: String, required: true },
  },
  {
    collection: 'certificates',
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model('Certificate', CertificateSchema);