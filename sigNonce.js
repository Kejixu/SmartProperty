window = global; navigator = {}; Bitcoin = {};
eval(require('fs').readFileSync('./bitcoinjs-min.js')+'');
eval(require('fs').readFileSync('./bitcoinsig.js') + '');
var bitcore = require('bitcore');

module.exports =  {
  //var message = '46zkX6BEkjqTwNbH';

  //var address = 'L25UABheoEpVtvKc41soxwdohhdZf6Mh6EjZ5ogcHwFAVzfKeSW3';
  //var pk = new bitcore.PrivateKey();
  //var address = pk;
  //console.log(address);
  //console.log(pk.toAddress());
  signN: function (message, pk) {
    var bytes = Bitcoin.Base58.decode(pk);
    var end = bytes.length - 4;
    var hash = bytes.slice(0, end);
    var version = hash.shift();

    var compressed = false;

    var payload = hash;
    if (payload.length > 32) {
      payload.pop();
      compressed = true;
    }

    var eckey = new Bitcoin.ECKey(payload);
    var curve = getSECCurveByName("secp256k1");
    var pt = curve.getG().multiply(eckey.priv);

    var x = pt.getX().toBigInteger();
    var y = pt.getY().toBigInteger();
    var enc = integerToBytes(x, 32);
    if (compressed) {
      if (y.isEven()) {
        enc.unshift(0x02);
      } else {
        enc.unshift(0x03);
      }
    } else {
      enc.unshift(0x04);
      enc = enc.concat(integerToBytes(y,32));
    }
    eckey.pub = enc;

    eckey.pubKeyHash = Bitcoin.Util.sha256ripe160(eckey.pub);
    var addr = new Bitcoin.Address(eckey.getPubKeyHash);
    //addr.version = (version - 128)&256;

    var sig = sign_message(eckey, message, compressed, version);

    console.log(sig);
    return sig;
  }
}




