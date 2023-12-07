const mongoose = require('mongoose');

const dbURL = 'mongodb://127.0.0.1:27017/Loc8r';
mongoose.connect(dbURL,{useNewUrlParser: true});

mongoose.connection.on('connected',function(){
    console.log(`Mongoose connected to ${dbURL} 2021810042-유승엽`);
});

mongoose.connection.on('error',function(err){
    console.log(`Mongoose connection error: ${err}` );
});

mongoose.connection.on('disconnected',function(){
    console.log("Mongoose disconnected");
});

var gracefulShutdown = function(msg,callback){
    mongoose.connection.close(function(){
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

process.once('SIGUSR2',function(){
    gracefulShutdown('nodemon restart',function(){
        process.kill(process.pid,'SIGUSR2');
    });
});

process.on('SIGINT',function(){
    gracefulShutdown('app termination',function(){
        process.exit(0);
    });
});

process.on('SIGTERM',function(){
    gracefulShutdown('Heroku app shut down',function(){
        process.exit(0);
    }); 
});

require('./location');
require('./users');
