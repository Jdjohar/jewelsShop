const mongoose = require('mongoose');
const slugify = require('slugify'); // <-- add this

const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true }, // <-- add this
  description: { type: String },
  CategoryName: { type: String, required: true },
  img: { type: String, required: true },
  featured: { type: Boolean, default: false },
  options: [],
  inventory: {
    quantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
  }
});

// Create slug before saving
productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('food_item', productSchema);
