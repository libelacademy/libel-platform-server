/** @format */

const { mongoose } = require('./../config/database');

const UserSchema = new mongoose.Schema(
  {
    avatar: { type: String, default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'student', 'instructor'],
      required: true,
      default: 'student',
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', default: null },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      required: true,
      default: 'local',
    },
    providerId: { type: String, default: null },

    country: { type: String, default: null },
    phone: { type: String, default: null },
    about: [{ type: String }],

    website: { type: String, default: null },
    social: {
      facebook: { type: String, default: null },
      twitter: { type: String, default: null },
      linkedin: { type: String, default: null },
      instagram: { type: String, default: null },
    }
  },
  {
    collection: 'users',
    timestamps: true,
    versionKey: false,
  }
);


UserSchema.statics.findStudentData = async function (id)  {
  const [data] = await this.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'user',
        as: 'student',
      },
    },
    {
      $unwind: {
        path: '$student',
        preserveNullAndEmptyArrays: true,
      },
    }
  ]);

  return data;
}


UserSchema.statics.findInstructorData = async function (id)  {
  const data = await this.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: 'instructors',
        localField: '_id',
        foreignField: 'user',
        as: 'instructor',
      },
    },
    {
      $unwind: {
        path: '$instructor',
        preserveNullAndEmptyArrays: true,
      },
    }
  ]);

  return data;
}


module.exports = mongoose.model('User', UserSchema);