/* Author: YOUR NAME HERE
*/
$(document).ready(function() {   


  var socket = io.connect();
  var step = 0;
  //Send
  $('#transact').bind('click', function(){
    //First submit
    if(step == 0) {
      //Buyer Client
      if($( "#subject option:selected").attr("value") == "buy") {
        step++;
        $("#server_outputs").append('<li>Waiting on Sellers...</li>');
        // Start showing sellers
        $(".currentSellers").show();
        $("#selection .currentSellers").append('<h4>Sellers:</h4>');
        //Showing Sellers and their costs/items
        socket.on('sellers', function(data){
          //Show Buying inputs (addresses)
         $(".buying").show();
         ////Each Sellers and their costs/items
         $("#selection .currentSellers").append('<div class="radio"><label><input type="radio" name="optradio" value=' + data.address
          + '> ' + data.item + " | " + data.price + " Satoshis </label></div>");
        });
      }
      //Seller Client
      else{
        $('.selling').hide();
        step++;
        $("#server_outputs").append('<li>Waiting on Buyers...</li>');
        var information = { item: $("#item").val(), price: $("#price").val(), address: $('#saddress').val()};
        socket.emit('selling', information);
        socket.on('showPrivate', function(){
          $("#server_outputs").append('<li>Buyer Found!</li>');
          $("#server_outputs").append('<li>Waiting for Buyer to sign Transaction....</li>');
        });
        socket.on('sellerReady', function(){
          $('.sellPriv').show();
        });
      }
    }
    // Second Submit
    else if(step == 1){
      // Buyer Client
      if($( "#subject option:selected").attr("value") == "buy") {
        step++;
        $("#server_outputs").append('<li>Seller Found. Waiting on UTXOs...</li>');
        // Creates object with payment address, recieve address
        var payment = {payaddress: $("#payaddress").val(), receieveaddres: $('.currentSellers input:radio[name=optradio]').val(), changeaddress: $('#chanaddress').val(), ownershipaddress: $('#newaddress').val()};
        socket.emit('payment', payment);  //Sends payment information to the server

        // Hides the sellers list
        $(".currentSellers").hide();
        // Shows UTXOs list based on payment address
        $(".currentUTXOs").show();
        $("#selection .currentUTXOs").append('<h4>Your UTXOs:</h4>');
        $(".buying").hide();
        socket.on('utxos', function(data){
          console.log(data);
          var hash = data[0].hash;
          var price = data[0].value;

          // Adds a checkbox of UTXos
         $("#selection .currentUTXOs").append('<div class="checkbox"><label><input type="checkbox" name=' + hash + ' value=' + price + '>' + hash + " " + price + " </label></div>");
        });
      }
      //Seller Client
      else{
        step++;
        console.log("here");
        socket.emit('sellPriv', $('#paddress').val());
        $('.sellPriv').hide();
        $("#server_outputs").append('<li>Waiting for Transaction to Complete....</li>');
        socket.on("transactionComplete", function(){
          alert("Transaction Done");
        });
      }
    }
    // Third Submit
    else if(step == 2){
      // Buyer Client
      if($( "#subject option:selected").attr("value") == "buy") {
        step++;
        //Waits for Transactions
        $("#server_outputs").append('<li>Waiting for Transaction to complete....</li>');
        // Checks for what is checkmarked for UTXOs
        var values = $('input:checkbox:checked').map(function () {
          val = {hash: this.name, cost: this.value};
          return val;
        }).get();
        //Send UTXOs to server
        socket.emit('selutxos', values); 
        $("#server_outputs").append('<li>Sending Information to Server....</li>');
        $(".currentUTXOs").hide();
        socket.on('showPrivate', function(){
          $('.buyPriv').show();
          $("#server_outputs").append('<li>Waiting for Transaction to be signed....</li>');
        });
      }  
    }

    // Fourth Submit
    else if(step == 3){
      // Buyer Client
      if($( "#subject option:selected").attr("value") == "buy") {
        step++;
        socket.emit('buyPriv', $('#priveaddress').val());
        $('.buyPriv').hide();
        $("#server_outputs").append('<li>Waiting for Transaction to be completed....</li>');
        socket.on("transactionComplete", function(){
          alert("Transaction Done");
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