const mongoose = require('mongoose')
const recipes = require('../models/Receipes');

const userSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    email:{
        type:String,
        required:true,
          unique: true,
    trim: true,
    lowercase: true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  savedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
    savedRecipes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Recipe'
    }],
    createdRecipes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Recipe'
    }],
    favRecipes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Recipe',
          index: true 
    }],
    createdAt:{
        type:Date
    },
    updatedAt:{
        type:Date
    }

},{timestamps:true})

module.exports= mongoose.model('User',userSchema);