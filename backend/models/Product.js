const mongoose = require('mongoose')
const { Schema } = mongoose;

const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required: false,
    },
    CategoryName: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        required: false,
        default: 'false'
    },
    options: [],
    inventory: {
        quantity: {
          type: Number,
          required: true,
          default: 0, // Default stock quantity
        },
        lowStockThreshold: {
          type: Number,
          required: false,
          default: 5, // Optional: Trigger low stock warning
        },
      },

})
module.exports = mongoose.model('food_item', productSchema)