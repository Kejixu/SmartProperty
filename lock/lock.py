""" This module connects the physical property to the blockchain and provides
an API for the owner to interact with the piece of property (in this case, a Lock)

"""

from blockchain import blockexplorer
import bitsig 
from coinspark import *
import blockchain
import zerorpc
import sys
import pyttsx
import signal
import user

class Lock(object):
    
    transaction = None
    public_address = None
    nonce = None
    nonce_flag = False

    def __init__(self):
        f = open('lock.txt','r')
        self.transaction = f.readline().rstrip()
        self.public_address = f.readline().rstrip()
        self.nonce = None
        self.nonce_flag = False
        if len(self.transaction) == 64:
            self.updateLock(1)

    def init_lock(self, address, trans):
        """ Initialize of global parameters storing lock address and transaction
            Can only be called once upon lock conception.

        :param: Public address associated with lock
        :param: Transaction associated with lock creation
        :return: String stating result of initalization call   
        """
        if len(self.transaction) == 64:
            return 'Propery has been Initialized previously'
        try: 
            blockexplorer.get_tx(trans)
        except blockchain.exceptions.APIException, TypeError:
            return 'Invalid transaction'
        try: 
            blockexplorer.get_address(address)
        except blockchain.exceptions.APIException, TypeError:
            return 'Invalid address'
        self.transaction = str(trans)
        self.public_address = str(address)
        f = open('lock.txt','w')
        f.write(self.transaction)
        f.write('\n')
        f.write(self.public_address)
        f.close()
        return 'Initialized' 

    def changeOwnership(self,trans):
        """ Change the address associated with the ownernship of this lock

        :param Valid transaction proving ownership changeOwnership
        :return: String stating outcome of attempted ownership change
        """

        newTransaction = 0
        
        # Check to see if transaction is valid and conerns this lock
        try: 
            newTransaction = blockexplorer.get_tx(trans)
        except blockchain.exceptions.APIException, TypeError:
            return 'Invalid transaction'
        inputs = newTransaction.inputs
        input_index = -1;
        for i in range(0,len(inputs)):
            if str(inputs[i].address) == self.public_address:
                input_index = i

        # Traverse blockchain to update lock ownership if credentials are outdated
        if input_index == -1:
            try:
                utxo = blockexplorer.get_unspent_outputs(self.public_address)
                tx_hashes  = [str(i.tx_hash) for i in utxo]
                if any(self.transaction in tx_hashes):
                    return 'Not Updated'
                else:
                    self.updateLock(1)                
            except blockchain.exceptions.APIException:
                response = 'go'
                j = 0
                while response == 'go':
                    old_address = blockexplorer.get_address(self.public_address)
                    outputs = old_address.transactions[0].outputs
                    scripts = [str(i.script) for i in outputs]   
                    num_inputs = len(old_address.transactions[0].inputs)
                    output_index = self.ProcessTransaction(scripts, True,num_inputs)
                    if output_index is None:
                        output_index = 0
                    else:
                        output_index = int(output_index)
                    last_trans_output = old_address.transactions[0].outputs[output_index]
                
                    included_block = old_address.transactions[0].block_height
                    latest_block = blockexplorer.get_latest_block()
                    if (latest_block.height - included_block < 3):
                        if j == 0:
                            return 'Not Updated because of lack of confidence'
                        if j > 0:
                            if trans == str(old_address.transaction[0].hash):
                                return 'Not enough confidence in provided transaction (updated to new address though)'
                            else:
                                return 'Not enough confidence but not in the provided transaction (updated to new address though)'
                    self.public_address = str(last_trans_output.address)
                    self.transaction = str(old_address.transactions[0].hash)
                    try:
                        blockexplorer.get_unspent_outputs(self.public_address)
                        reponse = 'exit'
                    except blockchain.exceptions.APIException:
                        j = j + 1
            if (trans == self.transaction):
                f = open('lock.txt','w')
                f.write(self.transaction)
                f.write('\n')
                f.write(self.public_address)
                f.close()
                return 'Updated property ownership with transaction provided'
            else:
                f = open('lock.txt','w')
                f.write(self.transaction)
                f.write('\n')
                f.write(self.public_address)
                f.close()
                return 'Updated but not with transaction provided'

        # Updates ownership given valid and relevant transaction
        else:    
            outputs = newTransaction.outputs
            scripts = [str(i.script) for i in outputs]   
            num_inputs = len(newTransaction.inputs)
            output_index = self.ProcessTransaction(scripts, True,num_inputs)
            if (output_index is None):
                return 'Invalid transaction, need metadata, property ownership lost forever'
            #output_index = int(output_index)      
            output_index = 0  
            new_address = str(outputs[output_index].address)
            included_block = newTransaction.block_height
            latest_block = blockexplorer.get_latest_block()
            if (latest_block.height - included_block < 3):
                return 'Not enough confidence in provided transaction'
            print newTransaction
            print new_address   
            self.transaction = trans
            self.public_address = new_address

            #write to log file and return
            f = open('lock.txt','w')
            f.write(self.transaction)
            f.write('\n')
            f.write(self.public_address)
            f.close()
            return 'Updated property ownership with transaction provided'

    def verifyOwnership(self,signature):
        """Verifies signature that corresponds to lock's address

        :param Signature created by signing most recet nonce given out
        :return: True if ownership is verified, false otherwise 
        """
        self.updateLock(1)
        if self.nonce_flag:
            print self.nonce_flag
            self.nonce_flag = False
            verification = bitsig.verify_message(self.public_address, signature, self.nonce)
            self.nonce = None
            if verification:
                engine = pyttsx.init()
                engine.setProperty('rate',70)
                engine.say('Lock Unlocked')
                engine.runAndWait()
                s.close() 
            return verification
        else:
            return 'Request new nonce first'


    def generateNonce(self,size=16):
        """ Generates a 16 character nonce to be signed by owner

        :param Size of nonce
        :return: Nonce of given size
        """

        chars=string.ascii_lowercase+string.ascii_uppercase + string.digits
        nonce = ''.join(random.choice(chars) for _ in range(size))
        self.nonce = nonce
        self.nonce_flag = True 
        return nonce

    def getTransaction(self, num):
        """ Get transaction associated with most recent lock ownership change

        :return: String of transaction hash
        """
        return self.transaction

    def getAddress(self, num):
        """ Get address associated with lock

        :return: String of public address of lock
        """
        return self.public_address
    
    def updateLock(self, num):
        """ Checks and updates lock if ownernship has changed 

        :return: Result of checking and updating lock ownership
        """
        try:
            utxo = blockexplorer.get_unspent_outputs(self.public_address)
            tx_hashes  = [str(i.tx_hash) for i in utxo]
            if any(self.transaction in tx_hashes):
                return 'Not Updated'
            else:
                response = 'go'
                j = 0
                while response == 'go':
                    old_address = blockexplorer.get_address(self.public_address)
                    outputs = old_address.transactions[0].outputs
                    scripts = [str(i.script) for i in outputs]   
                    num_inputs = len(old_address.transactions[0].inputs)
                    output_index = self.ProcessTransaction(scripts, True,num_inputs)
                    if output_index is None:
                        output_index = 0
                    else:
                        output_index = int(output_index)
                    last_trans_output = old_address.transactions[0].outputs[output_index]
                    
                    included_block = old_address.transactions[0].block_height
                    latest_block = blockexplorer.get_latest_block()
                    if (latest_block.height - included_block < 3):
                        if j == 0:
                            return 'Not Updated because of lack of confidence'
                        if j > 0:
                            if trans == str(old_address.transaction[0].hash):
                                return 'Not enough confidence in provided transaction (updated to new address though)'
                            else:
                                return 'Not enough confidence but not in the provided transaction (updated to new address though)'
                    self.public_address = str(last_trans_output.address)
                    self.transaction = str(old_address.transactions[0].hash)
                    try:
                        utxo_2 = blockexplorer.get_unspent_outputs(self.public_address)
                        tx_hashes_2s = [str(i.tx_hash) for i in utxo_2]
                        if any(self.transaction in tx_hashes_2):
                            reponse = 'exit'
                    except blockchain.exceptions.APIException:
                        j = j + 1

                    f = open('lock.txt','w')
                    f.write(self.transaction)
                    f.write('\n')
                    f.write(self.public_address)
                    f.close()
                    return 'Updated but not with transaction provided'

        except blockchain.exceptions.APIException:
            response = 'go'
            j = 0
            while response == 'go':
                old_address = blockexplorer.get_address(self.public_address)
                outputs = old_address.transactions[0].outputs
                scripts = [str(i.script) for i in outputs]   
                num_inputs = len(old_address.transactions[0].inputs)
                output_index = self.ProcessTransaction(scripts, True,num_inputs)
                if output_index is None:
                    output_index = 0
                else:
                    output_index = int(output_index)
                last_trans_output = old_address.transactions[0].outputs[output_index]
                
                included_block = old_address.transactions[0].block_height
                latest_block = blockexplorer.get_latest_block()
                if (latest_block.height - included_block < 3):
                    if j == 0:
                        return 'Not Updated because of lack of confidence'
                    if j > 0:
                        if trans == str(old_address.transaction[0].hash):
                            return 'Not enough confidence in provided transaction (updated to new address though)'
                        else:
                            return 'Not enough confidence but not in the provided transaction (updated to new address though)'
                self.public_address = str(last_trans_output.address)
                self.transaction = str(old_address.transactions[0].hash)
                try:
                    blockexplorer.get_unspent_outputs(self.public_address)
                    reponse = 'exit'
                except blockchain.exceptions.APIException:
                    j = j + 1

                f = open('lock.txt','w')
                f.write(self.transaction)
                f.write('\n')
                f.write(self.public_address)
                f.close()
                return 'Updated but not with transaction provided'
        
    def ProcessTransaction(self,scriptPubKeys, scriptsAreHex, countInputs):
        """ Extract metadata from Transaction with given output scripts (taken from coinspark API)

        param: scriptPubKeys is an array containing each output script of a transaction
        param: scriptsAareHex is whether scipts are hex or boolean
        param: countInputs is the number of inputs of the transaction
        :return: String of extracted metadata 
        """
        
        metadata=CoinSparkScriptsToMetadata(scriptPubKeys, scriptsAreHex)
     
        if not metadata is None:
            genesis=CoinSparkGenesis()                               
            if genesis.decode(metadata):
                print(genesis.toString())
                 
            transferList=CoinSparkTransferList()
            if transferList.decode(metadata, countInputs, len(scriptPubKeys)):
                print(transferList.toString())                   
     
            paymentRef=CoinSparkPaymentRef()
            if paymentRef.decode(metadata):
                print(paymentRef.toString())
            """
            message=CoinSparkMessage()
            if message.decode(metadata):
                sys.stdout.write(message.toString())
            """
            return metadata

def signal_handler(signal, frame):
    print 'Cannot Exit without Private Key'

    signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGQUIT, signal_handler)
signal.signal(signal.SIGABRT, signal_handler)
signal.signal(signal.SIGTSTP, signal_handler)
# Bind to itself and start running, waiting for any calls to its server
s = zerorpc.Server(Lock())
s.bind("tcp://0.0.0.0:4242")
print 'Go to BitTrade.herokuapp.com to Unlock'
s.run()
print 'Unlocked'
user.unlockedProtocol()