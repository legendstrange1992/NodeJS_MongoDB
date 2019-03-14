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
            title: " Đặt Mua Thành Công >..< ",
            icon: "success",
            button: "ok",
          });
	});
	
});