import blockchain
from blockchain import blockexplorer
import json
import sys

def hash_reverse(st):
  rev = ""
  for i in range(0, len(st) - 1, 2):
    rev += st[(len(st) - 2) - i]
    rev += st[(len(st) - 1) - i]
  return rev

addr = str(sys.argv[1])
if addr != 'testnet':
  results = []
  try:
    utxos = blockexplorer.get_unspent_outputs(addr)
    i = 0
    for utxo in utxos:
      txhash = hash_reverse(utxo.tx_hash)
      outputindex = utxo.tx_output_n
      satoshis = utxo.value
      data = [{'txhash': txhash, 'outputindex': outputindex, 'satoshis': satoshis}]
      results += data
    print json.dumps(results)
  except blockchain.exceptions.APIException:
    print json.dumps(results)
else:
  data = [{
  'txhash': '9dff9057d0f8677829a4fe06c552b6f861f3252c3c1d401121ddaf2f30765efa',
  'outputindex': 0,
  'satoshis':251000
  }]
  print json.dumps(data)

