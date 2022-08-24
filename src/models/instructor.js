/** @format */

const { mongoose } = require('./../config/database');

const InstructorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
      },
    ],
    ratings: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
        value: { type: Number, required: true },
      },
    ],
  },
  {
    collection: 'instructors',
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Instructor', InstructorSchema);
