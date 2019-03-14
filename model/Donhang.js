const mongoose                  = require('mongoose');
const Schema = mongoose.Schema;

const Donhang_Schema = new Schema({
    id_donhang      : Number,
    fullname        : String,
    address         : String,
    email           : String,
    zipcode         : String,
    phone           : String,
    total           : Number,
    total_currency  : String 
});
module.exports = mongoose.model('donhang',Donhang_Schema);