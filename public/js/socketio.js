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
        socket.emit('send-data-item-cart',{id_sanpham,soluong,size});
        swal({
            title: " Product is add your cart >..< ",
            icon: "success",
            button: "ok",
          });
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
	
});