const mongoose = require('mongoose');

const { mongo } = require('./index');

const connect = () => {
  try {
    mongoose.connect(mongo.uri, mongo.options);
    console.log('Database: MongoDB');
  } catch (err) {
    console.log(err);
  }
}


module.exports = {connect, mongoose};