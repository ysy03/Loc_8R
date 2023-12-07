const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    author:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:0,
        min:0,
        max:5
    },
    reviewText:{
        type:String,
        required:true
    },
    createdOn:{type:Date,default:Date.now}
})

const openingTImeSchema = new mongoose.Schema({
    days:{type:String, required:true},
    opening:String,
    closing:String,
    closed:{type:Boolean,required:true}
});

const locationSchema = new mongoose.Schema({
    name: {type:String,required:true},
    address: String,
    rating:{
        type:Number,
        'default':0, min:0, max:5
    },
    facilities:[String],
    coords:{type:{type:String},coordinates:[Number]},
    openingTimes:[openingTImeSchema],
   reviews:[reviewSchema]
})

mongoose.model('Location',locationSchema)