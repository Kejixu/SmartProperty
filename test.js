var bitcore = require('bitcore');
var g = require('./getUTXOs');
var pk = new bitcore.PrivateKey();
var addr = pk.toAddress();

/*g.getUTXOs(addr.toString(), function(utxos) {
  console.log(addr);
  console.log("UTXOs of new address (should be empty): " + utxos);
});*/

var existing = new bitcore.Address('1M7LC7GcpLnLmSb2Z5ACk1AKcEcHwYc8J5');

g.getUTXOs(existing.toString(), function(utxos) {
  console.log(existing);
  console.log("UTXOs of above address: " + JSON.stringify(utxos));
});
