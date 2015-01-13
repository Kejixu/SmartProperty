# Smart Property
This is an implementation of Smart Property, property whose ownership is controlled via the Bitcoin block chain.  
Link to the paper with implementations details and background on smart property. 

## Two Modules: Property and Server

### Property
Property implemented in Python, using a Raspberry Pi as the property, using the software to 'lock' the device until the correct signature was presented.  
Property uses ZeroRPC to communicate with the server.  

After installing the Raspbian disk image and pip

```
sudo pip install blockchain

sudo pip install zerorpc

sudo pip install pyttsx

sudo pip install ecdsa
```
Run `lock.py`.  The user can modify the file `user.py` to create a protocol for unlocking their lock.  

### Server

The server has the functionality to create smart property transactions (as detailed by the protocol here (https://en.bitcoin.it/wiki/Smart_Property#Theory)

The server also facilitates communication between the owner and their smart property, as detailed above.

The server is built on Node and uses Bitpay's bitcoin interface, Bitcore

Download and install node

```
npm install bitcore

npm install blocktrail-sdk
```
###Note

A single user would only pull the folder with the lock code from this repository because we are already running an existing server for smart property transactions.  
