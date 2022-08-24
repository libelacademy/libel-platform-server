const { mongoose } = require('./../config/database');


const ReviewSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    rating: { type: Number, required: true },
    comment: [{ type: String }],
  },
  {
    collection: 'reviews',
    timestamps: true,
    versionKey: false,
  }
)


module.exports = mongoose.model('Review', ReviewSchema);