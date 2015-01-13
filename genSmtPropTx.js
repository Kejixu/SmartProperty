/* genSmtPropTx.js
 *
 *  Seller imports a recPayKey, price, ownershipKey.
 *
 *  Buyer enters in a list of utxos, and a change address, and a privateKey.
 *
 */
var bitcore = require('bitcore');
var fs = require('fs');
var async = require('async');
var util = require('./getUTXOs');

module.exports = {
  genSmtPropTx: function(buyer, seller, callback2){
      var nodes = JSON.parse(fs.readFileSync('nodelist.json', 'utf8'));

      var isTestNet = false;
      var network = isTestNet ? bitcore.Networks.testnet : bitcore.Networks.livenet;


      var txFee = 10000; //10000 Satoshis = Typical fee for txs < 1000 bytes

      var metadata = '0';

      // Created a seller with private key: 92h53Ku1LQDHrGhAMWHbb6KA2Vm1FSG6yzebDzkT9DaLZzmPBnq

      /*var seller = {
      recPayAddr: '1P6YnT66VRAv3xsDtiKxGBtxXtYC335uaA',
      price: 30000,
      ownershipKey: 'L4GfMXAU8yrKS6yeiS51ecQFHn4QMiLet9RPn1P1rccAgSmn7Jjj'
      };

      // Created a buyer with changePrivKey: cRQtmbcnRBNvA14egPtibc5QpzG7kWzd9WqWet7fYzC57pmkgd56

      var buyer = {
      utxolist: [{
        txhash: '9bbe0be9c6359cf7eae5c5d0105cd572745c53be2fabedc23cdf0ca3d3e0c0af',
        outputindex: 0,
        amount: 48420
      }],
      changeAddr: '16P4ScrQVD9xrgVHPhKUGJo2GjdJjfEKqV',
      privateKey: '5KEDGkHbhAUiCnLLnVJPZZTsXD5km4ApkGAt6vAttKxZEuKoWLB'
      };*/

      // Currently testing on the testnet, using the node from tpfaucet.appspot.com

      var testNode = {
        ip: '54.210.107.2',
        port: 18333,
        network: bitcore.Networks.testnet
      };

      var ownerKey = new bitcore.PrivateKey(seller.ownershipKey);
      var ownershipAddr = ownerKey.toAddress();

      // Create a new smart property ownership key
      var newOwnerKey = new bitcore.PrivateKey.fromRandom(network);
      var newOwnerAddr = newOwnerKey.toAddress();


      var changeAddr = new bitcore.Address(buyer.changeAddr);

      util.getUTXOs(ownershipAddr, function(utxos) {
        if (utxos.length != 1) console.log('Too many utxos for smart property.');

        var utxo = utxos[0];
        console.log(utxo);

        var ownershipUtxo = {
          'txId':utxo.hash,
          outputIndex:utxo.index,
          satoshis:utxo.value,
          script:new bitcore.Script(ownershipAddr)
        };

        var inputSatoshis = 0;
        for (var i = 0; i < buyer.utxolist.length; i++)
          inputSatoshis += buyer.utxolist[i].amount;

        if (inputSatoshis < seller.price + txFee) {
          console.log('inputted bitcoins are too few');
          console.log(inputSatoshis);
          console.log(seller.price);
          console.log(txFee);
          throw 'not paid enough';
        }

        var buyerKey = new bitcore.PrivateKey(buyer.privateKey);
        var buyerAddr = buyerKey.toAddress(); //n3Xx6gPRfJKmfKUSLxzZUPX4sji7cZiLZa

        var recAddr = new bitcore.Address(seller.recPayAddr);

        var tx = new bitcore.Transaction();
        console.log("to: " + newOwnerAddr + ": " + ownershipUtxo.satoshis);
        tx.to(newOwnerAddr, ownershipUtxo.satoshis);
        console.log("to: " + recAddr + ": " + seller.price);
        tx.to(recAddr, seller.price);
        console.log("to: " + changeAddr + ": " + (inputSatoshis - (seller.price + txFee)));
        tx.to(changeAddr, inputSatoshis - (seller.price + txFee));
        console.log("from: " + ownershipUtxo.txId);
        tx.from(ownershipUtxo);
        for (i = 0; i < buyer.utxolist.length; i++) {
          var paymentUtxo = {
            'txId':buyer.utxolist[i].txhash,
            outputIndex:buyer.utxolist[i].outputindex,
            satoshis:buyer.utxolist[i].amount,
            script:new bitcore.Script(buyerAddr)
          };
          console.log("from: " + paymentUtxo.txId);
          tx.from(paymentUtxo);
        }
        tx.addData(metadata);
        console.log(tx.isFullySigned());
        /*var ownerSigs = tx.getSignatures(ownerKey);
        for (i = 0; i < ownerSigs.length; i++) {
          console.log('ownerSigs[' + i + ']: ' + tx.isValidSignature(ownerSigs[i]) + ownerSigs[i].inputIndex);
        }
        var buyerSigs = tx.getSignatures(buyerKey);
        for (i = 0; i < buyerSigs.length; i++) {
          console.log('buyerSigs[' + i + ']: ' + tx.isValidSignature(buyerSigs[i]) + buyerSigs[i].inputIndex);
        }*/
        tx.sign(ownerKey);
        console.log(tx.isFullySigned());
        tx.sign(buyerKey);
        console.log(tx._inputAmount);

        console.log(tx.verify() && tx.hasAllUtxoInfo() && tx.isFullySigned());

        // Now we attempt to broadcast the tx
        var peer;
        if (isTestNet) {

          // First, we create the Peer
          peer = new bitcore.transport.Peer(testNode.ip, testNode.port, testNode.network);

          // The peer uses event listeners these are basic printing status and such
          peer.on('ready', function () {
            console.log(peer.version, peer.subversion, peer.bestHeight);
            // We can also send messages here
            var txMessage = new bitcore.transport.Messages.Transaction(tx);
            peer.sendMessage(txMessage);
            console.log('transaction has been broadcast');
            peer.disconnect();
          });

          peer.on('disconnect', function () {
            console.log('connection closed');
          });

          // Connect and send the message!

          peer.connect();
        }
        else {
          var peers = [];
          i = 0;
          for (i = 0; i < nodes.length; i++) {
            peers[i] = new bitcore.transport.Peer(nodes[i].ip, nodes[i].port, bitcore.Networks.livenet);
            console.log('created peer ' + i + ' with ip: ' + nodes[i].ip);
          }

          async.each(peers,
            function(peer, callback) {

              peer.on('ready', function() {
                console.log('connected to ip: ' + peer.host);
                var message = new bitcore.transport.Messages.Transaction(tx);
                peer.sendMessage(message);
                console.log('sent transaction to ip: ' + peer.host);
                peer.disconnect();
              });

              peer.connect();

              console.log('beginning connecting of ' + peer.host);

              callback();

            },
            function(err){

              callback2(newOwnerKey);

            });
        }
      });

  }
}
