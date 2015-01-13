/* Author: YOUR NAME HERE
*/
$(document).ready(function() {   
  

  var socket = io.connect();
  var step = 0;
  //Send
  $('#transact').bind('click', function(){
    console.log("step: " + step);
    //First submit
    if(step == 0) {
      //Buyer Client
      if($( "#subject option:selected").attr("value") == "buy") {
        $("#server_outputs").append('<li>Waiting on Sellers...</li>');
        // Start showing sellers
        $(".currentSellers").show();
        $("#selection .currentSellers").append('<h4>Sellers:</h4>');
        //Showing Sellers and their costs/items
        socket.on('sellers', function(data){
          //Show Buying inputs (addresses)
         $(".buying").show();
         ////Each Sellers and their costs/items
         $("#selection .currentSellers").append('<div class="radio"><label><input type="radio" cost=' + data.price + ' name="optradio" value=' + data.address
          + '> ' + data.item + " | " + data.price + " Satoshis </label></div>");
        });
        step++;
      }
      //Seller Client
      else{
        $('.selling').hide();
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
        step++
      }
      
    }
    // Second Submit
    else if(step == 1){
      // Buyer Client
      if($( "#subject option:selected").attr("value") == "buy") {
        $("#server_outputs").append('<li>Seller Found. Waiting on UTXOs...</li>');
        // Creates object with payment address, recieve address
        var payment = {payaddress: $("#payaddress").val(), price: $('input[name=optradio]:checked').attr('cost'), receieveaddress: $('input[name=optradio]:checked').val(), changeaddress: $('#chanaddress').val()};
        socket.emit('payment', payment);  //Sends payment information to the server

        // Hides the sellers list
        $(".currentSellers").hide();
        // Shows UTXOs list based on payment address
        $(".currentUTXOs").show();
        $("#selection .currentUTXOs").append('<h4>Your UTXOs:</h4>');
        $(".buying").hide();
        socket.on('utxos', function(data){
          console.log(data);
          var x;
          for (x = 0; x < data.length; x++){
            var hash = data[x].hash;
            var price = data[x].value;
            var index = data[x].index;

            // Adds a checkbox of UTXos
           $("#selection .currentUTXOs").append('<div class="checkbox"><label><input type="checkbox" index='+index+ ' name=' + hash + ' value=' + price + '>' + hash + " " + price + " </label></div>");
          }
        });
        step++;
      }
      //Seller Client
      else{      
        step++;
        console.log("send")
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
        //Waits for Transactions
        $("#server_outputs").append('<li>Waiting for Transaction to complete....</li>');
        // Checks for what is checkmarked for UTXOs
        var values = $('input:checkbox:checked').map(function () {
          val = {hash: this.name, cost: this.value, index: this.getAttribute("index")};
          return val;
        }).get();
        console.log(values);
        //Send UTXOs to server
        socket.emit('selutxos', values); 
        $("#server_outputs").append('<li>Sending Information to Server....</li>');
        $(".currentUTXOs").hide();
        socket.on('showPrivate', function(){
          $('.buyPriv').show();
          $("#server_outputs").append('<li>Waiting for Transaction to be signed....</li>');
        });
        step++;
      }
      else{

      }
      
    }

    // Fourth Submit
    else if(step == 3){
      // Buyer Client
      if($( "#subject option:selected").attr("value") == "buy") {
        socket.emit('buyPriv', $('#priveaddress').val());
        $('.buyPriv').hide();
        $("#server_outputs").append('<li>Waiting for Transaction to be completed....</li>');
        socket.on("transactionComplete", function(tansInfo){
          alert("Transaction Done. See server output for property details");
          $("#server_outputs").append('<li>Public Address' + transInfo.privateKey + ' </li>');
          $("#server_outputs").append('<li>Private Key' + transInfo.publicAddress + ' </li>');
        });
        step++;
        
      }
    }

  });



$('#initial').bind('click', function(){
  $('button').hide();
  $('.buying').show();
  $('#signs').show();
});


var click = 1;
$('#signs').bind('click', function() {
  if(click == 1){
    click++;
    $('.buying').hide();
    var myAddresses = {payaddress: $('#payaddress').val(), changeaddress: $('#chanaddress').val(), propVal: $('#propvalue').val()};
    socket.emit('propertyPayment', myAddresses);
    console.log(myAddresses);
    $(".currentUTXOs").append('<h4>Your UTXOs:</h4>');
    socket.on('utxos', function(data){
      console.log(data);
      var x;
      for (x = 0; x < data.length; x++){
        var hash = data[x].hash;
        var price = data[x].value;
        var index = data[x].index;

        // Adds a checkbox of UTXos
       $("#selection .currentUTXOs").append('<div class="checkbox"><label><input type="checkbox" index='+index+ ' name=' + hash + ' value=' + price + '>' + hash + " " + price + " </label></div>");
      }
    });
  }
  else if(click == 2) {
    click++;
    var values = $('input:checkbox:checked').map(function () {
          val = {hash: this.name, cost: this.value, index: this.getAttribute("index")};
          return val;
        }).get();
        console.log(values);
        //Send UTXOs to server
        socket.emit('selutxos', values); 
        $("#server_outputs").append('<li>Sending Information to Server....</li>');
    $(".currentUTXOs").hide();
    $(".buyPriv").show();
  }
  else if(click == 3){
    click++;
    socket.emit('sendPropPriv', $("#priveaddress").val());
    $(".buyPriv").hide();
  }
});

$("#turnOn").bind('click', function(){
    $('button').hide();
    $('.lockCommands button').show();
    $('.lockCommands').show();
});


$('.lockCommands #init').click(function(){
  console.log('init');
  socket.emit('keyInit');
  socket.on('initResponse', function(res) {
    alert(res);
  });
});


$('.lockCommands #getTx').click(function(){
  console.log('tx init');
  socket.emit('listenTx');

  socket.on('txResponse', function(res) {
    alert(res);
  });
});


$('.lockCommands #getAddress').click(function(){
  console.log('init');
  socket.emit('listenAddress');
  socket.on('adResponse', function(res) {
    alert(res);
  });
});


$('.lockCommands #open').click(function(){
  console.log('opening');
  socket.emit('getNonce');
  socket.on('nonceResponse', function(res) {
    $('#notes').append("<div class='alert alert-danger' role='alert'>Nonce: " + res + " </div>")
    $('.privNKey').show();
    $('.privNKey #keySend').show();
  });
});

$('#keySend').click(function() {
  console.log('submit');
  socket.emit('sigNonce', $("#privNKey").val());
  $('.privNKey').hide();
  socket.on('ownershipValidate', function(res){
    alert(res);
  })
})

});