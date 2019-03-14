const express               = require('express');
const app                   = express();
const mongodb               = require('mongodb');
const mongoose              = require('mongoose');
const routes                = require('./routes/route');
const server                = require('http').createServer(app);
const io                    = require('socket.io')(server);
const session               = require('express-session');
const Sanpham_model         = require('./model/Sanpham');
const currencyFormatter     = require('currency-formatter');
const bodyParser            = require('body-parser');
//-----------------------------------------------------------------------------------------




//----------------------------------- socket.io--------------------------------------------------------
session.cart = [];
io.on('connection',socket => {
    console.log('co nguoi ket noi den server : ' + socket.id);
    socket.on('send-data-item-cart', async data => {
        var cart = session.cart;
        if(cart.length == 0){
            var item = await Sanpham_model.find({_id:mongodb.ObjectID(data.id_sanpham)}).exec();
            var ob = {
                id_sanpham          : item[0]._id,
                tensanpham          : item[0].tensanpham,
                dongia              : item[0].dongia,
                hinh                : item[0].hinh[0],
                soluong             : data.soluong,
                soluong_currency    : currencyFormatter.format(Number(data.soluong), {decimal: ',',precision: 0}),
                thanhtien           : Number(item[0].dongia) * Number(data.soluong),
                thanhtien_currency  : currencyFormatter.format((Number(item[0].dongia) * Number(data.soluong)), {decimal: ',',precision: 0}),
                size                : data.size
            };
            cart.push(ob);
        }
        else{ 
            var count = cart.length;
            for(let i = 0 ; i < count; i++){ 
                if(cart[i].id_sanpham == data.id_sanpham){
                    if(cart[i].size === data.size){
                        cart[i].soluong            = Number(cart[i].soluong) + Number(data.soluong);
                        cart[i].soluong_currency   = currencyFormatter.format(Number(cart[i].soluong ), {decimal: ',',precision: 0});
                        cart[i].thanhtien          = Number(cart[i].soluong) * Number(cart[i].dongia);
                        cart[i].thanhtien_currency = currencyFormatter.format(Number(cart[i].thanhtien ), {decimal: ',',precision: 0});
                        break;
                    }
                    else{
                        if(i==count-1){
                            var item = await Sanpham_model.find({_id:mongodb.ObjectID(data.id_sanpham)}).exec();
                            var ob = {
                                id_sanpham          : item[0]._id,
                                tensanpham          : item[0].tensanpham,
                                dongia              : item[0].dongia,
                                hinh                : item[0].hinh[0],
                                soluong             : data.soluong,
                                soluong_currency    : currencyFormatter.format(Number(data.soluong), {decimal: ',',precision: 0}),
                                thanhtien           : Number(item[0].dongia) * Number(data.soluong),
                                thanhtien_currency  : currencyFormatter.format(Number(Number(item[0].dongia) * Number(data.soluong)), {decimal: ',',precision: 0}),
                                size                : data.size
                            };
                            cart.push(ob);
                        }
                    }
                }
                else{
                    if( i == count - 1 ) {
                        var item = await Sanpham_model.find({_id:mongodb.ObjectID(data.id_sanpham)}).exec();
                        var ob = {
                            id_sanpham          : item[0]._id,
                            tensanpham          : item[0].tensanpham,
                            dongia              : item[0].dongia,
                            hinh                : item[0].hinh[0],
                            soluong             : data.soluong,
                            soluong_currency    : currencyFormatter.format(Number(data.soluong), {decimal: ',',precision: 0}),
                            thanhtien           : Number(item[0].dongia) * Number(data.soluong),
                            thanhtien_currency  : currencyFormatter.format(Number(Number(item[0].dongia) * Number(data.soluong)), {decimal: ',',precision: 0}),
                            size                : data.size
                        };
                        cart.push(ob);
                    }
                }
            }
        }
        socket.emit('server-send-cart-length',{ cart_length : session.cart.length});
    });
    socket.emit('server-send-cart-length',{ cart_length : session.cart.length});
})
//-------------------------------------------------------------------------------------------
server.listen(3000);
console.log('ket noi toi port : 3000');
mongoose.connect('mongodb://legendstrange1992:Ky776041164@ds149365.mlab.com:49365/shop',{ useNewUrlParser:true});

//-------------------------------------------------------------------------------------------
app.use(express.static('./public'));
app.set('view engine','ejs');
app.set('views','./views');
app.use(session({ secret: 'keyboard cat', resave: false,saveUninitialized: true, cookie: { maxAge: 60000 }}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(routes);






