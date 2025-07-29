const mongoose = require('mongoose')

const { Schema } = mongoose;

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    // location:{
    //     type:String,
    //     required:false,
    // },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:{
        type:String,

    },
    resetTokenExpiry:{
        type:Date,
     
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Role can be 'user' or 'admin'
        default: 'user' // Default role is 'user'
    },
    stripeCustomerId: {
        type: String, // Store Stripe customer ID
        default: null,
    },
    date:{
        type:Date,
        default:Date.now
    },

  });

  module.exports = mongoose.model('user',UserSchema)