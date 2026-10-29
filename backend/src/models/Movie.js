const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    synopsis: {
      type: String,
      required: [true, 'Movie synopsis is required']
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required']
    },
    backdropUrl: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: '' // YouTube embed or video link
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration in minutes is required']
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    genre: {
      type: [String],
      required: true,
      default: ['Action']
    },
    language: {
      type: [String],
      required: true,
      default: ['English']
    },
    formats: {
      type: [String],
      default: ['2D', '3D', 'IMAX 3D']
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA'
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    votesCount: {
      type: Number,
      default: 0
    },
    director: {
      type: String,
      default: 'Unknown'
    },
    cast: [
      {
        name: String,
        role: String,
        avatar: String
      }
    ],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Auto-generate a UNIQUE slug (dune-part-two, dune-part-two-2, ...) when missing or when the title changes
movieSchema.pre('save', async function (next) {
  try {
    if (this.isModified('title') || !this.slug) {
      const base = slugify(this.title) || 'movie';
      let candidate = base;
      let suffix = 2;
      // eslint-disable-next-line no-await-in-loop
      while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      this.slug = candidate;
    }
    next();
  } catch (err) {
    next(err);
  }
});

movieSchema.statics.slugify = slugify;

module.exports = mongoose.model('Movie', movieSchema);
