const mongoose = require('mongoose')

const recipesSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    type: String
  }],
  image: {
    type: String
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true
    },
    time: {
      type: Number,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
   likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
     type: mongoose.Schema.Types.ObjectId,
      ref: 'Comments' }],
}, { timestamps: true });
module.exports= mongoose.model('Recipe',recipesSchema);