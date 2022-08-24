/** @format */

const { mongoose } = require('./../config/database');

const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    membership: { type: String, enum: ['free', 'libel'], default: 'free' },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }],
    enrollments: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        enrollmentAt: { type: Date, default: Date.now },    
        status: { type: String, enum: ['process', 'completed', 'pending'], default: 'process' },
        startAt: { type: Date, default: Date.now },
        completedAt: { type: Date, default: null },
        completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
        currentLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
        certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null },
      }
    ],
  },
  {
    collection: 'students',
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model('Student', StudentSchema);