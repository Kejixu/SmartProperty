var bitcore = require('bitcore');
var fs = require('fs');
var async = require('async');

/* {string} privKey - private key to sign the utxo list
 * {int} propertyValue - amount of satoshis to put into the property UTXO
 * {string} changeAddress
 * utxolist = { {string} txhash
 *              {int} outputindex
 *              {int} amount }
 * {function} callback2 - function should tell client about recPK
 */

module.exports = {
  smartProp: function (privKey, propertyValue, changeAddress, utxolist, callback2) {
    var network = bitcore.Networks.livenet;
    var payPK = new bitcore.PrivateKey(privKey);
    var payAddr = payPK.toAddress();

    var recPK = new bitcore.PrivateKey.fromRandom(network);
    console.log(recPK);
    var recAddr = recPK.toAddress();

    var changeAddr = new bitcore.Address(changeAddress);

    var txFee = 10000; //satoshis
    var minCoin = 5430; //min accepted number of satoshis

    var metadata = 'New Smart Property Created';

    var inputSatoshis = 0;
    for (var i = 0; i < utxolist.length; i++)
      inputSatoshis += utxolist[i].amount;

    if (propertyValue < minCoin) {
      throw 'must put more than 5430 satoshis on property';
    }

    if (inputSatoshis < txFee + propertyValue) {
      console.log('inputted bitcoins are too few');
      throw 'not paid enough';
    }

    var tx = new bitcore.Transaction();
    console.log("to: " + recAddr + ": " + propertyValue);
    tx.to(recAddr, propertyValue);
    console.log("to: " + changeAddr + ": " + (inputSatoshis - (propertyValue + txFee)));
    tx.to(changeAddr, inputSatoshis - (propertyValue + txFee));
    for (i = 0; i < utxolist.length; i++) {
      var paymentUtxo = {
        'txId':utxolist[i].txhash,
        outputIndex:utxolist[i].outputindex,
        satoshis:utxolist[i].amount,
        script:new bitcore.Script(payAddr)
      };
      console.log("from: " + paymentUtxo.txId);
      tx.from(paymentUtxo);
    }
    tx.addData(metadata);
    tx.sign(payPK);

    var nodes = [];
    if (network == bitcore.Networks.testnet) {
      var testNode = {
        ip: '54.210.107.2',
        port: 18333
      };
      nodes = [testNode];
    } else {
      nodes = JSON.parse(fs.readFileSync('nodelist.json', 'utf8'));
    }

    var peers = [];
    i = 0;
    for (i = 0; i < nodes.length; i++) {
      peers[i] = new bitcore.transport.Peer(nodes[i].ip, nodes[i].port, network);
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
        callback2(recPK, bitcore.util.buffer.bufferToHex(tx._getHash()));
      });
  }
};