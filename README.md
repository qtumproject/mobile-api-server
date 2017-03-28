

# API

## Contracts / Generate token bytecode
`POST`

/contracts/generate-token-bytecode

[http://139.162.178.174/contracts/generate-token-bytecode](http://139.162.178.174/contracts/generate-token-bytecode)

request

```
{
	"initialSupply": uint256,
	"tokenName": String
	"decimalUnits": uint8
	"tokenSymbol": String
}
```

response

```
{
	"bytecode": String
}
```
## Send Raw Transaction
`POST`

/send-raw-transaction

[http://163.172.68.103:5931/send-raw-transaction](http://163.172.68.103:5931/send-raw-transaction)

request parameters

```
{
	"data": "raw transaction" // string,
	"allowHighFee": 1 // 1 or 0
}
```

## Get History
`GET`

/history/{address}/{limit}/{offset}

`MAX_LIMIT = 50;`

[http://163.172.68.103:5931/history/mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3/2/0](http://163.172.68.103:5931/history/mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3/2/0)

response

```
[{
    "block_time": 1490695912|null,
    "block_height": 23552|-1,
    "block_hash": "3d36b340291a59a900cd889de9190da83f041dcd2032d86a047294659dc81467"|null,
    "tx_hash": "ead66f4c2cbaeece281d4b66ae89b65f0a46f9a2e57936d55dcd8ec1f16f5817",
    "amount": 16876000000,
    "from_address": ["mhwwh16xzmc996rr9656RYt1M4fDXerYTW", "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"],
    "to_address": ["mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"]
}]
```

## Get History for several addresses
`GET`
 
/history/{limit}/{offset}?addresses[]={:address}&addresses[]={:address2}

`MAX_LIMIT = 50;`

[http://163.172.68.103:5931/history/2/0?addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3](http://163.172.68.103:5931/history/2/0?addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3)

response

```
[{
	"block_time": 1490695912|null,
	"block_height": 23552|-1,
	"block_hash": "3d36b340291a59a900cd889de9190da83f041dcd2032d86a047294659dc81467"|null,
	"tx_hash": "ead66f4c2cbaeece281d4b66ae89b65f0a46f9a2e57936d55dcd8ec1f16f5817",
	"amount": 16876000000,
	"from_address": ["mhwwh16xzmc996rr9656RYt1M4fDXerYTW", "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"],
	"to_address": ["mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"]
}]
```

## Get unspent outputs
`GET`

/outputs/unspent/{address}

[http://163.172.68.103:5931/outputs/unspent/mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3](http://163.172.68.103:5931/outputs/unspent/mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3)

response

```
[{
    address: "mxDkwrDixgLNhNW9HHq73d1VpLcwYUtyja",
    tx_hash: "c038b71aaa6fa6a1fab239fa880483ecf36d664553456ad3985b522b1612f7e5",
    vout: 1,
    txout_scriptPubKey: "76a914b739980629d47e0de6e3fac7513cff7fe36e6fff88ac",
    amount: 1,
    block_height: 100000000,
    pubkey_hash: String
}]
```

## Get unspent outputs for several addresses
`GET`

/outputs/unspent?addresses[]={:address}&addresses[]={:address2}

[http://163.172.68.103:5931/outputs/unspent?addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3&addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3](http://163.172.68.103:5931/outputs/unspent?addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3&addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3)

response

```
[{
    address: "mxDkwrDixgLNhNW9HHq73d1VpLcwYUtyja",
    tx_hash: "c038b71aaa6fa6a1fab239fa880483ecf36d664553456ad3985b522b1612f7e5",
    vout: 1,
    txout_scriptPubKey: "76a914b739980629d47e0de6e3fac7513cff7fe36e6fff88ac",
    amount: 1,
    block_height: 100000000|null,
    pubkey_hash: String
    
}]
```

## Get news
`GET`

/news/{lang}

[http://163.172.68.103:5931/news/en](http://163.172.68.103:5931/news/en)

response
```
[{
	"id": 287,
	"date": "2017-01-15T10:45:51",
	"link": "https://qtum.org/qa-about-qtum-project/",
	"title": "Q&#038;A About Qtum Project",
	"body": "These questions were asked in Slack Channel...",
	"short": "These questions were asked in Qtum...",
	"image": "https://qtum.org/wp-content/uploads/2017/01/Telephone-Game.png"
}]
```

## Get blockchain info

`GET`

/blockchain/info

[http://163.172.68.103:5931/blockchain/info](http://163.172.68.103:5931/blockchain/info)

response
```
{
	"version": 130000,
	"protocolversion": 70014,
	"walletversion": 130000,
	"balance": 144668.2987138,
	"blocks": 5274,
	"timeoffset": 0,
	"connections": 3,
	"proxy": "",
	"difficulty": 52537.66724975229,
	"testnet": true,
	"keypoololdest": 1485441915,
	"keypoolsize": 100,
	"paytxfee": 0,
	"relayfee": 0.00001,
	"errors": ""
}
```

# Web Socket API

The web socket API is served using [socket.io](http://socket.io).

``quantumd/addressbalance``

Subscribe:

```
    socket.emit('subscribe', 'quantumd/addressbalance', ["mt8WVPpaThMykC6cMrParAbykRBYWLDkPR"]);
```

Unsubscribe:

```
    socket.emit('unsubscribe', 'quantumd/addressbalance', ["mt8WVPpaThMykC6cMrParAbykRBYWLDkPR"]);
```

or

```
    socket.emit('unsubscribe', 'quantumd/addressbalance');
```

Listen:

```
    socket.on('quantumd/addressbalance', function(data) {
         console.log("New data received: " + data.txid);
         console.log("New data received: " + data.address);
         console.log("New data received: " + data.balance);
         console.log("New data received: " + data.totalReceived);
         console.log("New data received: " + data.totalSpent);
         console.log("New data received: " + data.unconfirmedBalance);
    });
```

Sample output:

```
{
    "txid": String,
    "address": String,
    "balance": Integer,
    "totalReceived": Integer,
    "totalSpent": Integer
    
}
```


### Example Usage

html
```
<html>
<body>
  <script src="http://<insight-server>:<port>/socket.io/socket.io.js"></script>
  <script>
    
    var eventToListenTo = 'quantumd/addressbalance',
        socket = io("http://<insight-server>:<port>/");
    
    socket.on('connect', function() {
      socket.emit('subscribe', eventToListenTo, ["mt8WVPpaThMykC6cMrParAbykRBYWLDkPR"]);
    });
    
    socket.on(eventToListenTo, function(data) {
      console.log("New data received: " + data.txid)
    });
  </script>
</body>
</html>
```