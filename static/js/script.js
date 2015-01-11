/* Author: YOUR NAME HERE
*/
$(document).ready(function() {   


  var socket = io.connect();
  var step = 0;
  $('#transact').bind('click', function(){
    if(step == 0) {
      if($( "#subject option:selected").attr("value") == "buy") {
        step++;
        $("#server_outputs").append('<li>Waiting on Sellers...</li>');
        $(".currentSellers").show();
        $("#selection .currentSellers").append('<h4>Sellers:</h4>');
        socket.on('sellers', function(data){
         $(".buying").show();
         $("#selection .currentSellers").append('<div class="radio"><label><input type="radio" name="optradio" value=' + data.address
          + '> ' + data.item + " | " + data.price + " Satoshis </label></div>");
        });
      }
      else{
        step++;
        $("#server_outputs").append('<li>Waiting on Buyers...</li>');
        var information = { item: $("#item").val(), price: $("#price").val(), address: $('#saddress').val()};
        socket.emit('selling', information);
      }
    }
    else if(step == 1){
      if($( "#subject option:selected").attr("value") == "buy") {
        step++;
        $("#server_outputs").append('<li>Seller Found. Waiting on UTXOs...</li>');
        var payment = {myaddress: $("#payaddress").val(), payaddress: $('.currentSellers input:radio[name=optradio]').val()};
        socket.emit('payment', payment);
        $(".currentSellers").hide();
        $(".currentUTXOs").show();
        $("#selection .currentUTXOs").append('<h4>Your UTXOs:</h4>');
        socket.on('utxos', function(data){
         $("#selection .currentUTXOs").append('<div class="radio"><label><input type="radio" name="utxoradio"> ' + 
          data + " </label></div>");
        });
      }  
    }

  });


  	


 /* $('#sender').bind('click', function() {
   socket.emit('message', 'Message Sent on ' + new Date());     
  });

  socket.on('server_message', function(data){
   $('#receiver').append('<li>' + data + '</li>');  
  }); */


});