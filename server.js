var express = require('express');
var app = express();
var mongoose = require('mongoose');
app.use(express.static('./public'));
app.set('view engine','ejs');
app.set('views','./views');
var SanPham_Model  = require('./model/Sanpham.js');
var server = require('http').createServer(app);
server.listen(3000);
console.log('ket noi toi port : 3000');
mongoose.connect('mongodb://legendstrange1992:Ky776041164@ds149365.mlab.com:49365/shop',{ useNewUrlParser:true});
app.get('/', async function(request,response){
    response.render('index');
});





