

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

[http://139.162.178.174/send-raw-transaction](http://139.162.178.174/send-raw-transaction)

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

[http://139.162.178.174/history/1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5/2/0](http://139.162.178.174/history/1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5/2/0)

response

```
[{
	"block_time": 1479825024,
	"block_height": 14111,
	"block_hash": "abda6c7c88c2300fd9c62f494d742a2ec070683284492c8f77fc58ce02dff488",
	"tx_hash": "ae80a3ec71b2a58b03585e379f1e08fd1ac7412f1e9f96181ec2f5af072648f2",
	"txin_pos": 0,
	"amount": -1000000000000,
	"from_address": "1LsLpGVYKSwrvHwqPpzvth18Wk8i5pyca2",
	"to_address": "1LsLpGVYKSwrvHwqPpzvth18Wk8i5pyca2"
}]
```

## Get History for several addresses
`GET`

/history/{limit}/{offset}?addresses[]={:address}&addresses[]={:address2}

[http://139.162.178.174/history/2/0?addresses[]=1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5](http://139.162.178.174/history/2/0?addresses[]=1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5)

response

```
[{
	"block_time": 1479825024,
	"block_height": 14111,
	"block_hash": "abda6c7c88c2300fd9c62f494d742a2ec070683284492c8f77fc58ce02dff488",
	"tx_hash": "ae80a3ec71b2a58b03585e379f1e08fd1ac7412f1e9f96181ec2f5af072648f2",
	"txin_pos": 0,
	"amount": -1000000000000,
	"from_address": "1LsLpGVYKSwrvHwqPpzvth18Wk8i5pyca2",
	"to_address": "1LsLpGVYKSwrvHwqPpzvth18Wk8i5pyca2"
}]
```

## Get unspent outputs
`GET`

/outputs/unspent/{address}

[http://139.162.178.174/outputs/unspent/1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5](http://139.162.178.174/outputs/unspent/1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5)

response

```
[{
	"amount": 99989999995420,
	"vout": 0,
	"tx_id": 18398,
	"block_id": 15305,
	"block_height": 14111,
	"txout_id": 36775,
	"txout_scriptPubKey": "76a914ca9466c29560b9fdfa1deb95c95af9ddfb40c79d88ac",
	"tx_hash": "85c71cc1a065e8607821df764891397cf5d5a8a4af3126987ab4632de5b2eb68",
	"block_hash": "85aebc2ea4488e0d68cda6fd53b37e0589b2c3c38538d3040d34090ea7a9de5f",
	"pubkey_hash": "ca9466c29560b9fdfa1deb95c95af9ddfb40c79d"
}]
```

## Get unspent outputs for several addresses
`GET`

/outputs/unspent?addresses[]={:address}&addresses[]={:address2}

[http://139.162.178.174/outputs/unspent?addresses[]=1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5&addresses[]=1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5](http://139.162.178.174/outputs/unspent?addresses[]=1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5&addresses[]=1HQSVAgFkMwwQ8xuhgQPQ8jFxKBk9kHWD5)

response

```
[{
	"amount": 99989999995420,
	"vout": 0,
	"tx_id": 18398,
	"block_id": 15305,
	"block_height": 14111,
	"txout_id": 36775,
	"txout_scriptPubKey": "76a914ca9466c29560b9fdfa1deb95c95af9ddfb40c79d88ac",
	"tx_hash": "85c71cc1a065e8607821df764891397cf5d5a8a4af3126987ab4632de5b2eb68",
	"block_hash": "85aebc2ea4488e0d68cda6fd53b37e0589b2c3c38538d3040d34090ea7a9de5f",
	"pubkey_hash": "ca9466c29560b9fdfa1deb95c95af9ddfb40c79d"
}]
```

## Get news
`GET`

/news/{lang}

[http://139.162.178.174/news/en](http://139.162.178.174/news/en)

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

[http://139.162.178.174/blockchain/info](http://139.162.178.174/blockchain/info)

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

``quantumd/addresstxid``

Subscribe:

```
    socket.emit('subscribe', 'quantumd/addresstxid', ["mt8WVPpaThMykC6cMrParAbykRBYWLDkPR"]);
```

Unsubscribe:

```
    socket.emit('unsubscribe', 'quantumd/addresstxid', ["mt8WVPpaThMykC6cMrParAbykRBYWLDkPR"]);
```

or

```
    socket.emit('unsubscribe', 'quantumd/addresstxid');
```

Listen:

```
    socket.on('quantumd/addresstxid', function(data) {
         console.log("New data received: " + data.txid);
         console.log("New data received: " + data.address);
    });
```

Sample output:

```
{
    "txid": String,
    "address": String
}
```


### Example Usage

html
```
<html>
<body>
  <script src="http://<insight-server>:<port>/socket.io/socket.io.js"></script>
  <script>
    
    var eventToListenTo = 'quantumd/addresstxid',
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