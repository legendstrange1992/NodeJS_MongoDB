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
var mang_room = [];
session.array_chat = [];
io.on('connection',socket => {
    var room = '';
    // --------------------socket cart -------------------
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
    if(session.cart != null){socket.emit('server-send-cart-length',{ cart_length : session.cart.length});}
    socket.on('update-cart',data => {
        var count = session.cart.length;
        var total = 0;
        for(let i = 0 ; i < count ; i++ ){
            session.cart[i]['soluong'] = data[i];
            session.cart[i]['thanhtien'] = Number(session.cart[i]['soluong']) * Number(session.cart[i]['dongia']);
            session.cart[i]['thanhtien_currency'] = currencyFormatter.format(Number(session.cart[i]['thanhtien']), {decimal: ',',precision: 0});
            total += session.cart[i]['thanhtien'];
        }
        socket.emit('server-send-cart-update',{cart:session.cart ,total:currencyFormatter.format(Number(total), {decimal: ',',precision: 0})});
    })

    // --------------------socket chat ------------------
    socket.on('user_client_room',(data)=>{
        socket.join(data);
        socket.room = data;
        room = data;
        mang_room = [];
        for(r in socket.adapter.rooms){
            if(r.length < 20){
                mang_room.push(r);
            }
        }
        socket.emit('server-send-room-socket',data);
        io.sockets.emit('server-send-rooms',mang_room);
    })
    socket.on('admin_choose_room',(data)=>{
        socket.join(data);
        room = data;
        var data_chat = [];
        session.array_chat.forEach((item)=>{
            var user_admin = "Admin_"+data;
            if(item.user == data || item.user == user_admin ){
                data_chat.push(item);
            }
        })
        io.sockets.in(data).emit('server-send-data-chat-admin-choose-room',data_chat);
    })
    socket.on('client-send-data-chat', (data)=>{
        
        if(data.user == "Admin"){
            var user = "Admin_"+room;
            var ob = {
                user : user,
                noidung : data.noidung
            }
            session.array_chat.push(ob);
        }
        else{
            var ob = {
                user : data.user,
                noidung : data.noidung
            }
            session.array_chat.push(ob);
        }
        var data_chat = [];
        session.array_chat.forEach((item)=>{
            var user_admin = "Admin_"+room;
            if(item.user == room || item.user == user_admin ){
                data_chat.push(item);
            }
        })
        io.sockets.in(room).emit('sever-send-data-chat',{data,data_chat});
    })
    socket.on('load_noidung_chat',(data)=>{
        var data_chat = [];
        session.array_chat.forEach((item)=>{
            var user_admin = "Admin_"+room;
            if(item.user == data.user || item.user == user_admin ){
                data_chat.push(item);
            }
        })
        io.sockets.in(room).emit('server-send-data-load-noidung-chat',{data_chat});
    })
    socket.on('load-user',()=>{
        mang_room = [];
        for(r in socket.adapter.rooms){
            if(r.length < 20){
                mang_room.push(r);
            }
        }
        
        io.sockets.emit('server-send-rooms',mang_room);
    })
    socket.on("disconnect",()=>{
        mang_room = [];
        for(r in socket.adapter.rooms){
            mang_room.push(r);
        }
        mang_room.splice(mang_room.indexOf(room),1);
        mang_room.splice(mang_room.indexOf(socket.id),1);
        io.sockets.emit('server-send-rooms',mang_room);
    })
    
})
//-------------------------------------------------------------------------------------------
server.listen(process.env.PORT || 3000);
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






