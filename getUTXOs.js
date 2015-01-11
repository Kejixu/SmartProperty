var blocktrail = require('blocktrail-sdk');
var client = blocktrail({apiKey: "8c6e805875fed1ad88284486cac85cf2c2a69587",apiSecret: "c37cddf52b14fed05aa771b30f400c9df3a6fe60"});

module.exports = {
  getUTXOs: function (address, callback) {

    if (!address) return;

    var params;

    client.addressUnspentOutputs(address, params,
      function (err, address_utxos) {
        callback(address_utxos.data);
      });
  }
};