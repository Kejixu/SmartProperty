var zerorpc = require("zerorpc");
var bitcore = require("bitcore");
var client = new zerorpc.Client();
client.connect("tcp://128.112.224.127:4242");
var initial_address = "1DaAdNSeJk2X1vbfTXTNWtt5RxFRqpFAys";
var initial_transaction = "793f84c05731ad93eccfc1c355022548b5a696526ebf51291dae83a950bcddc5";

module.exports = {

    initLock: function(initial_address, initial_transaction, callback){
        client.invoke("init_lock",initial_address, initial_transaction ,function(error, res, more) {
            if(error) {
                console.error(error);
            } else {
                console.log("UPDATE:", res);
                callback(res);
            }
        });
    },

    getTx: function(callback){
        client.invoke("getTransaction",1,function(error, res, more) {
            if(error) {
                console.error(error);
            } else {
                console.log("UPDATE:", res);
                callback(res);
            }
        });
    },
    getAddress: function(callback){
        client.invoke("getAddress",1,function(error, res, more) {
        if(error) {
            console.error(error);
        } else {
            console.log("UPDATE:", res);
            callback(res);
        }
         });   
    },
    
    getNonce: function(callback){
        var nonce;
        client.invoke("generateNonce",16,function(error, res, more) {
        if(error) {
            console.error(error);
        } else {
            nonce = res;
            callback(res);
        }
        });  
    },

    getOwner: function(sig, callback){
        client.invoke("verifyOwnership",sig ,function(error, res, more) {
        if(error) {
            console.error(error);
        } else {
            console.log("UPDATE:", res);
            callback(res);
        }
    });   
    }
    /*
    var newTrans = "4afdb206fbcb2882866dfeae8f051dbd430f67ba742cf24204d05195ab4f6325"
    client.invoke("changeOwnership",newTrans,function(error, res, more) {
        if(error) {
            console.error(error);
        } else {
            console.log("UPDATE:", res);
        }
    });
    */

   /* var nonce;
    client.invoke("generateNonce",1,function(error, res, more) {
        if(error) {
            console.error(error);
        } else {
            nonce = res
        }
    });
    //sig = signNonce(PK, Nonce)
    /*client.invoke("verifyOwnership",sig ,function(error, res, more) {
        if(error) {
            console.error(error);
        } else {
            console.log("UPDATE:", res);
        }
    });*/
}
