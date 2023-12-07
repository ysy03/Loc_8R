const mongoose = require('mongoose');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    hash:String,
    salt:String
});

userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password,this.salt,1000,64,'sha512').toString('hex');
}

userSchema.methods.vaildPassword = function(password){
    const hash = crypto.pbkdf2Sync(password,this.salt,1000,64,'sha512').toString('hex');
    return this.hash === hash;
}

userSchema.methods.generateJWT = function(){
    const expity = new Date();
    expity.setDate(expity.getDate()+7);
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            exp: parseInt(expity.getTime()/1000,10)
        },process.env.JWT_SECRET
    );
};

mongoose.model('User',userSchema);

