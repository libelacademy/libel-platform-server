const { mongoose } = require('./../config/database');


const LessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: [{ type: String, required: true }],
    type: { type: String, enum: ['youtube', 'vimeo', 'iframe'], required: true },
    video: { type: String, required: true },
    duration: { type: Number, required: true },
    previous: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    next: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    head: { type: Boolean, default: false },
  },
  {
    collection: 'lessons',
    timestamps: true,
    versionKey: false,
  }

);


module.exports = mongoose.model('Lesson', LessonSchema);