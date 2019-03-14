const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SanphamSchema = new Schema(
    {
        tensanpham : String,
        hinh : String,
        dongia : Number,
        hinh : [],
        mota : String
    }
);
module.exports = mongoose.model('sanpham',SanphamSchema);


