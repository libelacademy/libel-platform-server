const { mongoose } = require('../config/database');


const FeedbackSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    description: [{ type: String, required: true }],
    type: { type: String, enum: ['youtube', 'vimeo', 'iframe'], required: true },
    video: { type: String, required: true },
    duration: { type: Number, required: true }
  },
  {
    collection: 'feedbacks',
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model('Feedback', FeedbackSchema);