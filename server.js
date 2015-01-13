//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , utxos = require('./getUTXOs')
    , genTx = require('./genSmtPropTx')
    , bitcore = require('bitcore')
    , port = (process.env.PORT || 8081);

var pk = new bitcore.PrivateKey();
var addr = pk.toAddress();
var existing = new bitcore.Address('1M7LC7GcpLnLmSb2Z5ACk1AKcEcHwYc8J5');


/*utxos.getUTXOs(addr.toString(), function(utxos) {
  console.log(addr);
  console.log("UTXOs of new address (should be empty): " + utxos);
});*/

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);



//Setup Socket.IO
var io = io.listen(server);
var sellBio = {};
var buyBio = {};

io.sockets.on('connection', function(socket){
  
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
  //  socket.emit('server_message',data);
  });

  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });

  
  // Get the seller's information
  socket.on('selling', function(data){
    // Broadcast the sellers information
//    socket.emit('sellers', data);
    io.sockets.emit('sellers', data);
  });

  // Listening for Buyer's payment information
  socket.on('payment', function(payment){
    sellBio.recPayAddr = payment.receieveaddress;
    sellBio.price = parseInt(payment.price);
    buyBio.changeAddr = payment.changeaddress;
    addr = new bitcore.Address(payment.payaddress);
    // Get the UTXOs
    utxos.getUTXOs(addr.toString(), function(utxos){
      console.log("waiting");
      // Send the utxos
      socket.emit('utxos', utxos);
      // Listen for the selected utxos
      socket.on('selutxos', function(myUTXOs) {
        console.log("selected UTXOs");
        console.log(myUTXOs);
        var myList = [];
        var x;
        for(x = 0; x < myUTXOs.length; x++) {
          var selU = {};
          selU.txhash = myUTXOs[x].hash;
          selU.outputindex = parseInt(myUTXOs[x].index);
          selU.amount = parseInt(myUTXOs[x].cost);
          myList.push(selU);
        }
        buyBio.utxolist = myList; 
        // Sends the buyer's private address ready
        io.sockets.emit('showPrivate');
        // Listen for buyerkey
        socket.on('buyPriv', function(buyerKey){
          // Let's seller know it's ready
          buyBio.privateKey = buyerKey;
          io.sockets.emit('sellerReady');
          //console.log("ownerkey: " + ownerKey);          
            
        });

      });
    });

  });

  socket.on('sellPriv', function(ownerKey){
            sellBio.ownershipKey = ownerKey;
            console.log(sellBio);
            console.log(buyBio);
            genTx.genSmtPropTx(buyBio, sellBio, function(data) {
              var propertyInfo = {};
              propertyInfo.privateKey = data;
              var pubk = new bitcore.PrivateKey(data);
              propertyInfo.publicAddress = pubk.toAddress();
              io.sockets.emit("transactionComplete", propertyInfo);
            })
            
  });

});



///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Smart Property'
             ,description: 'Trade your bitcoins for "smart" objects'
             ,author: 'Keji Xu'
             ,analyticssiteid: 'XXXXXXX' 
            }
    });
});

server.get('/transaction', function(req,res){
  res.render('transaction.jade', {
    locals : { 
              title : 'Smart Property'
             ,description: 'Trade'
             ,author: 'Keji Xu'
             ,analyticssiteid: 'XXXXXXX' 
            }
    });
});

server.get('/unlock', function(req,res){
  res.render('unlock.jade', {
    locals : { 
              title : 'Smart Property'
             ,description: 'Unlock you lock'
             ,author: 'Keji Xu'
             ,analyticssiteid: 'XXXXXXX' 
            }
    });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
