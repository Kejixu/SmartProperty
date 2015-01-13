var bitcore = require('bitcore');
var g = require('./getUTXOs');
var pk = new bitcore.PrivateKey();
var addr = pk.toAddress();

/*g.getUTXOs(addr.toString(), function(utxos) {
  console.log(addr);
  console.log("UTXOs of new address (should be empty): " + utxos);
});*/

//var existing = new bitcore.Address('1M7LC7GcpLnLmSb2Z5ACk1AKcEcHwYc8J5');
var existing = new bitcore.Address('1bones8VWK2LbDYZ8TJAME9gpHaV2ZCGT');

g.getUTXOs(existing.toString(), function(utxos) {
  console.log(existing);
  console.log("UTXOs of above address: " + JSON.stringify(utxos));
});

/* 

LIVENET

1) Buyer:
New Public Key:
1J2zDyhocgpoXTEqoRWpJbayud2bJ6zLEG

New Private Key:
b5066e55ec46e43298007a0327819f4dc0c2eb7790d1fd8cdf6553d355dec2fb


2) Change:

Public Address:
1P6YnT66VRAv3xsDtiKxGBtxXtYC335uaA

Private Key:
5Jh23u9GQmPpRnjRkxRnvSfKh3kTJcaqEUWq4cNigwN3UiDATFh

3) Seller
Public Address:
13pdeSACNsS7AioSKgxADpfYcEZYWSEK8T

Private Key: 
5KEDGkHbhAUiCnLLnVJPZZTsXD5km4ApkGAt6vAttKxZEuKoWLB

4) Property

Public Address:
1LC8FaHY8WDKyBuzdbNzzzP6HG4uQf69M8

Private Key:
7878fea17d131251e8cfb0590ae22156fbb2d9b7e7122896784325180d8b8828

TESTNET
1) Buyer
Public Address
n3U7zMMsaDAw4NVowdLhhJkkNzHWaemC37

Private Key:
92CWKrzb2ftGK8wT9nU1MWNunpvXsnAFaNdfYnE7k6pUoqHPiUc

Change Address:
public - n3bxX9iM5JQ3kxsfqdfFrYhPHn3CxLuPEx
private - cRQtmbcnRBNvA14egPtibc5QpzG7kWzd9WqWet7fYzC57pmkgd56

2) Seller
Public Address:
n11TokHNzxjGmqZ32SGZAhCUGsdrWUMank

Private Key:
92h53Ku1LQDHrGhAMWHbb6KA2Vm1FSG6yzebDzkT9DaLZzmPBnq

Ownership Public Address:
n3Xx6gPRfJKmfKUSLxzZUPX4sji7cZiLZa

Ownership Private key:
cQJ3cZTN6J5WmyAoKjdJg8m4mnFpnSehWnbDKVqStMydbxmqsytE


Old Property Addresses:
Old Public Address:
15Q2T6DrjXLobxwqe6bk8dudeNA6RCHb9K

Old Private Key:
L4GfMXAU8yrKS6yeiS51ecQFHn4QMiLet9RPn1P1rccAgSmn7Jjj 


Public Address:
16P4ScrQVD9xrgVHPhKUGJo2GjdJjfEKqV

Private Key:
5JVV4wVC7rmnC2MrehkLVXdSQw77QUBTtTDJCGyLzx2M2x5Puc2


*/