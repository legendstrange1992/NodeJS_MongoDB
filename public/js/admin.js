$(function(){
    $('.show_donhang').on('click',function(){
        const id_donhang = $(this).attr('data-id_donhang');
        $('.chitiet_donhang'+id_donhang).slideToggle();
    });
})