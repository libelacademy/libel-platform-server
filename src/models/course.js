
const { mongoose } = require('./../config/database');


const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },

    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],

    image: { type: String, required: true },
    trailer: { type: String, required: true },

    abstract: { type: String, required: true },
    description: [{ type: String, required: true }],

    level: { type: String, enum: ['Principiante', 'Intermedio', 'Avanzado'], required: true, default: 'Principiante' },
    price: { type: Number, required: true },
    duration: { type: Number, default: 0 },

    discord: {
      general: { type: String, default: null },
      private: { type: String, default: null },
    },
    featured: { type: Boolean, default: false },
    feedback: { type: Boolean, default: false },
    certificate: { type: Boolean, default: false },
    access: { type: Number, default: 12 },
    
    requirements: [{ type: String, required: true }],
    whatYouLearn: [{ type: String, required: true }],
    audience: [{ type: String, required: true }],
    
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
    feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }],
    materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'courses',
    timestamps: true,
    versionKey: false,
  }
);


module.exports = mongoose.model('Course', CourseSchema);