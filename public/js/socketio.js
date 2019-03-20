$(function(){
    var socket = io('http://localhost:3000');
    $('.rdo').on('click',function(){
		$('.rdo').removeClass('rdo_active');
		$(this).addClass('rdo_active');
	});
    $('.shopnow_product_detail').on('click',function(){
      var id_sanpham = $(this).attr('data-id_sanpham');
		  var soluong = $('#quantity_product_detail').val();
		  var size = $(this).parent().find('.rdo_active').attr('data-size');
      if($(this).hasClass('active_effect')){
        return;
      }
      $(this).addClass('active_effect');
      var img = $(this).parent().parent().find('.product-pic-zoom');
      var src = img.find('img').attr('src');
      var cart =  $(document).find('.shopping-card');
      var parTop = img.offset().top;
      var parLeft = img.offset().left;
      $('<img/>',{
        class:'img_fly',
        src:src
      }).appendTo('body').css({
        'top':parTop - 25,
        'left':parLeft + img.width() - 80
      });
      setTimeout(function(){
        $(document).find('.img_fly').css({
          'top' : cart.offset().top -25,
          'left' : cart.offset().left
        });
        setTimeout(function(){
          $(document).find('.img_fly').remove();
          $(document).find('.shopnow_product_detail').removeClass('active_effect');
          socket.emit('send-data-item-cart',{id_sanpham,soluong,size});
        },800)
      },500)
  });
  socket.on('server-send-cart-length',function(data){
    $('#cart_length').html(data.cart_length);
  })
  $('.submit-order-btn').on('click',function(){
    var fullname = $('#fullname').val();
    var address = $('#address').val();
    var email = $('#email').val();
    var zipcode = $('#zipcode').val();
    var phone = $('#phone').val();
    if(fullname != '' && address != '' && email != '' && zipcode != '' && phone != '' ){
      swal({
        title: " Bạn đã đặt hàng thành công !!! ",
        icon : "success",
        button : ' Về Trang Chủ'
      }).then(ok => {
        if(ok)
          $.ajax({
            url:'/cart-complete',
            data : {fullname,address,email,zipcode,phone},
            type : 'POST',
            success:function(data){
              if(data=='ok'){window.location.href = '/';}
            }
          });
      });
      
    }
  });
	$('.update_cart').on('click',function(){
    var mang_sl = $('.sl_cart');
    var data = [];
    for(let i = 0 ; i < mang_sl.length ; i++ ){
      data[i] = mang_sl[i].value;
    }
    socket.emit('update-cart',data);
  });
  socket.on('server-send-cart-update',function(data){
    var array_thanhtien_currency = $('.thanhtien_currency');
    for(let i = 0 ; i < array_thanhtien_currency.length ; i++ ){
      array_thanhtien_currency[i].innerHTML = "$"+ data.cart[i]['thanhtien_currency'];
    }
    $('.total1').html('$'+data.total);
    $('.total2').html('$'+data.total);
    
  });
  $('.show-modal-login').on('click',function(){
    $('.modal-login').slideDown();
  });
  $('.close-modal').on('click',function(){
    $('.modal-login').slideUp();
  })
});