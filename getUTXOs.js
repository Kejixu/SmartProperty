var PythonShell = require('python-shell');

module.exports = {
  getUTXOs: function (address, callback) {

    if (! address) return;

    var options = {
      mode: 'json',
      args: address,
      scriptPath: '.'
    };

    var utxos;

    var pyshell = new PythonShell('getUTXOs.py', options);

    pyshell.on('message', function (message) {
      console.log('received utxos for address: ' + address);
      utxos = message;
    });

    pyshell.end(function(err) {
      if (err) throw err;

      console.log('python finished');
      callback(utxos);
    });
  }
};