const express               = require('express');
const Route                 = express.Router();
const session               = require('express-session');
const currencyFormatter     = require('currency-formatter');
const mongodb               = require('mongodb');
const SanPham_Model         = require('../model/Sanpham');
const Donhang_Model         = require('../model/Donhang');
const Chitietdonhang_Model  = require('../model/Chitietdonhang');
const multer                = require('multer');
const storage               = multer.diskStorage({
 destination: function (req, file, cb) {
    cb(null, './public/img/product')
    },
    filename: function (req, file, cb) {
    cb(null,Date.now() +'-'+ file.originalname )
    }
});
const upload = multer({ storage: storage }) ;
//------------------------middleware ------------------------------------------------



function xoa_dau(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
};


//------------------------Routes ------------------------------------------------
var anhs = [];
Route.post('/uploadfile',upload.any(),function(req,res){
    req.files.forEach(function(item){
        anhs.push(item.filename);
      })
      console.log(anhs);
    res.status(200).send(req.files);
})
Route.post('/upload-sanpham',async (req,res)=>{
    var ob = {
        tensanpham  : req.body.tensanpham,
        stt         : 8,
        hinhdaidien : anhs[0],
        dongia      : req.body.dongia,
        mota        : req.body.editor1,
        hinh        : anhs
    }
    var sp = new SanPham_Model(ob);
    sp.save();
    anhs = [];
    var data = await Donhang_Model.find({}).exec();
    var data2 = await Chitietdonhang_Model.find({}).exec();
    res.render('admin',{data,data2});
})

Route.get('/',async (req,res) => {
    var data = await SanPham_Model.find().exec();
    var data_letest = await SanPham_Model.find().sort({stt:-1}).exec();
    res.render('index',{data,data_letest});
});
Route.get('/product-detail/:id',async (req,res) => {
    var id = mongodb.ObjectId(req.params.id);
    var data = await SanPham_Model.find({_id:id}).exec();
    res.render('product',{data});
});
Route.get('/cart',(req,res) => {
    var data = session.cart;
    var total = 0;
    data.forEach(item=>{
        total += Number(item.thanhtien);
    });
    total = currencyFormatter.format(total, {decimal: ',',precision: 0});
    res.render('cart',{data,total});
})
Route.get('/check-out',(req,res) => {
    var data = session.cart;
    var total = 0;
    data.forEach(item=>{
        total += Number(item.thanhtien);
    });
    total = currencyFormatter.format(total, {decimal: ',',precision: 0});
    res.render('checkout',{total});
});
Route.post('/login',async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    if(username == 'thoaiky' && password == '123'){
        var data = await Donhang_Model.find({}).exec();
        var data2 = await Chitietdonhang_Model.find({}).exec();
        res.render('admin',{data,data2});
    }
    else{
        var data = await SanPham_Model.find().exec();
        var data_letest = await SanPham_Model.find().sort({stt:-1}).exec();
        res.render('index',{data,data_letest});
    }
})
Route.get('/upload',async (req,res)=>{
    res.render('upload');
})
Route.get('/admin',async (req,res)=>{
    var data = await Donhang_Model.find({}).exec();
    var data2 = await Chitietdonhang_Model.find({}).exec();
    res.render('admin',{data,data2});
})
Route.get('/chat',(req,res)=>{
    res.render('chat');
})
Route.post('/cart-complete', async (req,res) => {
    var data = session.cart;
    var total = 0;
    data.forEach(item=>{
        total += Number(item.thanhtien);
    });
    var dh = await Donhang_Model.find({}).sort({_id:-1}).limit(1).exec();
    if(dh.length == 0){
        var ob = {
            id_donhang      : 1,
            fullname        : req.body.fullname,
            address         : req.body.address,
            email           : req.body.email,
            zipcode         : req.body.zipcode,
            phone           : req.body.phone,
            total           : total,
            total_currency  : currencyFormatter.format(total, {decimal: ',',precision: 0})
        };
        var item = new Donhang_Model(ob);
        item.save();
        var cart = session.cart;
        cart.forEach(item => {
            var ob = {
                id_donhang          : 1,
                hinh                : item.hinh,
                tensanpham          : item.tensanpham,
                soluong             : item.soluong,
                dongia              : item.dongia,
                size                : item.size,
                thanhtien           : item.thanhtien,
                thanhtien_currency  : currencyFormatter.format(Number(item.thanhtien), {decimal: ',',precision: 0}) 
            };
            var ct = new Chitietdonhang_Model(ob);
            ct.save();
        });
    }
    else{
        var ob = {
            id_donhang      : Number((dh[0].id_donhang+1)),
            fullname        : req.body.fullname,
            address         : req.body.address,
            email           : req.body.email,
            zipcode         : req.body.zipcode,
            phone           : req.body.phone,
            total           : total,
            total_currency  : currencyFormatter.format(total, {decimal: ',',precision: 0})
        };
        var item = new Donhang_Model(ob);
        item.save();
        var cart = session.cart;
        cart.forEach(item => {
            var ob = {
                id_donhang          : Number((dh[0].id_donhang+1)),
                hinh                : item.hinh[0],
                tensanpham          : item.tensanpham,
                soluong             : item.soluong,
                dongia              : item.dongia,
                size                : item.size,
                thanhtien           : item.thanhtien,
                thanhtien_currency  : currencyFormatter.format(Number(item.thanhtien), {decimal: ',',precision: 0}) 
            };
            var ct = new Chitietdonhang_Model(ob);
            ct.save();
        });
    }
    session.cart = null;
    res.send('ok');
});
Route.get('/test',async (req,res)=>{
    var cart = session.cart;
    console.log(cart[0]);
})
module.exports = Route;
