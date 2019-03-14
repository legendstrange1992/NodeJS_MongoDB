const mongoose                  = require('mongoose');
const Schema = mongoose.Schema;

const Chitietdonhang_Schema = new Schema({
    id_donhang          : Number,
    hinh                : String,
    tensanpham          : String,
    soluong             : Number,
    dongia              : String,
    size                : String,
    thanhtien           : Number,
    thanhtien_currency  : String, 
});
module.exports = mongoose.model('chitietdonhang',Chitietdonhang_Schema);