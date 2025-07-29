const mongoose = require('mongoose');
const { Schema } = mongoose;

const brandSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  img: {
    type: String, // Optional: brand logo or banner
    required: false,
  },
});

module.exports = mongoose.model('Brand', brandSchema);
