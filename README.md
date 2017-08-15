## Table of Contents

* [API](#api)
* [QStore API](#qstore-api)

# API


## Contracts / Call
`POST`

/contracts/{addressContract}/call

Request
```
{
	"hashes": [String, String, ...]
}
```

Response
```
{
    "outputs": [
          {
             "hash": String,
             "output": String
           },
           ...
     ]
}
```

## Contracts / Encoder
`POST`

/contracts/encoder

Request
```
{
	"contract": String
}
```
Response
```
{
    ":MyToken": {
        bytecode: String,
        interface: [
            {
              "constant": true,
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "name": "",
                  "type": "string"
                }
              ],
              "payable": false,
              "type": "function"
            },
            ...
        ]
    },
    ":tokenRecipient": {
        bytecode: String,
        interface: [
            ...
        ]
    },
    ...
}
```


## Contracts / Generate token bytecode
`POST`

/contracts/generate-token-bytecode

[http://163.172.68.103:5931/contracts/generate-token-bytecode](http://139.162.178.174/contracts/generate-token-bytecode)

request

```
{
	"initialSupply": Uint256,
	"tokenName": String
	"decimalUnits": Uint8
	"tokenSymbol": String
}
```

response

```
{
	"bytecode": String
}
```


## Contracts / Params
`GET`

/contracts/{address_contract}/params?keys=symbol,decimals,name,totalSupply

[http://163.172.68.103:5931/contracts/6cf4916739f15e5aeaa45b246d0757f2062b1b8f/params?keys=symbol,decimals,name,totalSupply](http://139.162.178.174/contracts/6cf4916739f15e5aeaa45b246d0757f2062b1b8f/params?keys=symbol,decimals,name,totalSupply)


response: Object | null

```
{
	"symbol": String,
	"decimals": Integer,
	"name": String,
	"totalSupply": String
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


## Get Transaction
`GET`

/transactions/{tx_hash}

[http://163.172.68.103:5931/transactions/25fb98d4849f837d71f331eec74f71e9286e6a0b85d27218f7236dc69d8c990f](http://163.172.68.103:5931/transactions/25fb98d4849f837d71f331eec74f71e9286e6a0b85d27218f7236dc69d8c990f)

response: Object | null

```
{
    "block_time": 1491219489|null,
    "block_height": 31111|-1,
    "block_hash": "b0589be37f4e24bffea77bfc87f5bbd6f9a90c629306f7c3340c7c52a982e592"|null,
    "tx_hash": "25fb98d4849f837d71f331eec74f71e9286e6a0b85d27218f7236dc69d8c990f",
    "amount": 5, //qtum,
    "contract_has_been_created": true,
    "vout": [
        {
            "value": "2.00000000", //qtum
            "address": "mopkoZaJGQE32h8WME5F2oBk8hvD1CVdP7"
            
        },
        {
            "value": "2.99995400", //qtum
            "address": "mk5aX8HDEpSWF2P2dtdSN9aiAC7AHdzHEa"
        }
    ],
    "vin": [
        {
            value: "5", //qtum
            address: "mopkoZaJGQE32h8WME5F2oBk8hvD1CVdP7"
        }
    ]
}
```

## Get History
`GET`

/history/{address}/{limit}/{offset}

> `MAX_LIMIT = 50;`

[http://163.172.68.103:5931/history/mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3/2/0](http://163.172.68.103:5931/history/mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3/2/0)

response

```
{
    "totalItems": 2,
    "items": [
         {
             "block_time": 1490705700|null,
             "block_height": 23701|-1,
             "block_hash": "ea22d5650f6edf352790372c27edba05c4b3870f181ad245a2f9b63cfef39589"|null,
             "tx_hash": "79d78d6f54037045cd091c7ae1a3a84c07cd7a9c02190b26092e62b77feaea80",
             "amount": 1.875, //qtum
             "contract_has_been_created": true,
             "vout": [
                 {
                     "value": "1", //qtum
                     "address": "mr8Mezn8p7CmHvPBbfieSxfeNtHiG7AwfQ"
                 },
                 {
                     "value": "0.874", //qtum
                     "address": "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
                 }
             ],
             "vin": [
                 {
                     value: "1.875", //qtum
                     address: "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
                 }
             ]
         },
         ...
    ]
}
```

## Get History for several addresses
`GET`
 
/history/{limit}/{offset}?addresses[]={:address}&addresses[]={:address2}

> `MAX_LIMIT = 50;`

[http://163.172.68.103:5931/history/2/0?addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3](http://163.172.68.103:5931/history/2/0?addresses[]=mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3)

response

```
{
    "totalItems": 2,
    "items": [
         {
             "block_time": 1490705700|null,
             "block_height": 23701|-1,
             "block_hash": "ea22d5650f6edf352790372c27edba05c4b3870f181ad245a2f9b63cfef39589"|null,
             "tx_hash": "79d78d6f54037045cd091c7ae1a3a84c07cd7a9c02190b26092e62b77feaea80",
             "amount": 1.875, //qtum
             "contract_has_been_created": true,
             "vout": [
                 {
                     "value": "1", //qtum
                     "address": "mr8Mezn8p7CmHvPBbfieSxfeNtHiG7AwfQ"
                 },
                 {
                     "value": "0.874", //qtum
                     "address": "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
                 }
             ],
             "vin": [
                 {
                     value: "1.875", //qtum
                     address: "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
                 }
             ]
         },
         ...
    ]
}
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
    amount: 1, //qtum
    block_height: 100000000|-1,
    pubkey_hash: String,
    is_stake: Boolean,
    confirmations: Int
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
    amount: 1, //qtum
    block_height: 100000000|-1,
    pubkey_hash: String,
    is_stake: Boolean,
    confirmations: Int
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
	"date": "2017-07-18T09:36:13.717Z",
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

### Event ``token_balance_change``

Subscribe:

```
    socket.emit('subscribe', 'token_balance_change', {
            contract_address: '804ca5244b5ba927565398f861adcc17363d617e', 
            addresses: ["mg2zzpBoWQJsfmGgcytS6eVzW8sgZpDcak", "mzXrAjgbFca8yGo8wxkzLuZJAsAhMvHfJx"]
        }, {
          notificationToken: ?NotificationToken<String>, 
          prevToken: ?PreviousNotificationToken<String>,
          language: ?'en'
      })
```

> After subscribe will emit ``token_balance_change``

Unsubscribe:

```
    socket.emit('unsubscribe', 'token_balance_change', {
            contract_address: '804ca5244b5ba927565398f861adcc17363d617e', 
            addresses: ["mg2zzpBoWQJsfmGgcytS6eVzW8sgZpDcak"]
        }, {
           notificationToken: ?NotificationToken<String> 
      });
```

or

```
    socket.emit('unsubscribe', 'token_balance_change', {
            contract_address: '804ca5244b5ba927565398f861adcc17363d617e'
        }, {
           notificationToken: ?NotificationToken<String> 
       })
```

or

```
    socket.emit('unsubscribe', 'token_balance_change', null, {
             notificationToken: ?NotificationToken<String> 
        });
```


### Event ``token_balance_change``

Listen:
```
    socket.on('token_balance_change', function(data) {
         // Sample output
    });
```

Sample output:

```
{
    "contract_address": "804ca5244b5ba927565398f861adcc17363d617e",
    "balances": [
        {
            "address": "mg2zzpBoWQJsfmGgcytS6eVzW8sgZpDcak"
            "balance": 123456
        },
        ...
    ]
}
```


### Event ``balance_subscribe``

Subscribe:

```
    socket.emit('subscribe', 'balance_subscribe', ["mt8WVPpaThMykC6cMrParAbykRBYWLDkPR"], {
        notificationToken: ?NotificationToken<String>, 
        prevToken: ?PreviousNotificationToken<String>,
        language: ?'en'
    });
```

> After subscribe will emit ``balance_changed``

Unsubscribe:

```
    socket.emit('unsubscribe', 'balance_subscribe', ["mt8WVPpaThMykC6cMrParAbykRBYWLDkPR"], {
        notificationToken: ?NotificationToken<String> 
    });
```

or

```
    socket.emit('unsubscribe', 'balance_subscribe', null, {
        notificationToken: ?NotificationToken<String> 
    });
```

### Event ``balance_changed``

Listen:

```
    socket.on('balance_changed', function(data) {
         console.log("New data received: " + data.balance); //satoshis
         console.log("New data received: " + data.unconfirmedBalance); //satoshis
    });
```

Sample output:

```
{
    "balance": 1400000000,
    "unconfirmedBalance": 7900000000
}
```



### Event ``new_transaction``


Listen:

```
    socket.on('new_transaction', function(data) {
         console.log(data) // Sample output
    });
```

Sample output:

```
{
    "block_time": 1490705700|null,
    "block_height": 23701|-1,
    "block_hash": "ea22d5650f6edf352790372c27edba05c4b3870f181ad245a2f9b63cfef39589"|null,
    "tx_hash": "79d78d6f54037045cd091c7ae1a3a84c07cd7a9c02190b26092e62b77feaea80",
    "amount": 1.875, //qtum
    "contract_has_been_created": true,
    "vout": [
        {
            "value": "1", //qtum
            "address": "mr8Mezn8p7CmHvPBbfieSxfeNtHiG7AwfQ"
        },
        {
            "value": "0.874", //qtum
            "address": "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
        }
    ],
    "vin": [
        {
            value: "1.875", //qtum
            address: "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
        }
    ]
}
```

### Example Usage

html
```
<html>
<body>
  <script src="http://<insight-server>:<port>/socket.io/socket.io.js"></script>
  <script>
    
    var eventToListenTo = 'balance_subscribe',
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


# QStore API

##Trending now

`GET`

/contracts/trending-now 

Response: 

```
[{
    "id": "8a9d8f98as989s8dfak9a9k",
    "name": "Contract name",
    "type": "token", // token || crowdsale || other
    "price": "4.3432344", // cost in QTUM
    "count_buy": 3,
    "count_downloads": 323,
    "created_at": "2017-07-18T09:36:13.717Z"
}, ...]
```


## Last added

`GET`

/contracts/last-added
 
Response: 
 
```
[{
    "id": "8a9d8f98as989s8dfak9a9k",
    "name": "Contract name",
    "type": "token", // token || crowdsale || other
    "price": "4.3432344", // cost in QTUM
    "count_buy": 3,
    "count_downloads": 323,
    "created_at": "2017-07-18T09:37:06.193Z"
}, ...]
```

## Contract search

`GET`

/contracts/{count}/{offset}?type={type_name}&tags[]={tag}

Response: 

```
[{
    "id": "8a9d8f98as989s8dfak9a9k",
    "name": "Contract name",
    "type": "token", // token || crowdsale || other
    "price": "4.3432344", // cost in QTUM
    "count_buy": 3,
    "count_downloads": 323,
    "created_at": "2017-07-18T09:37:06.193Z",
    "tags": [
        "tag3",
        "tag4"
     ]
}, ...]
```

## Contract

`GET`

/contracts/{contract_id}

Response: 

```
{
    "id": "8a9d8f98as989s8dfak9a9k",
    "name": "Contract name",
    "description": "Contract description",
    "tags": ["crowdsale", "contract", "some_token"]
    "size": 14.3, // size in bytes
    "completed_on": "1.0.5",
    "with_sourse_code": true,
    "publisher_address": "1Hz96kJKF2HLPGY15JWLB5m9qGNxvt8tHJ",    
    "type": "token", // token || crowdsale || other
    "price": "4.3432344", // cost in QTUM
    "count_buy": 3,
    "count_downloads": 323,
    "created_at": "2017-07-18T09:37:06.193Z"
}
```

## Contract ABI

`GET`

/contracts/{contract_id}/abi

Response: 

```
{
    ":test": {
        "test": "test"
    }
}
```

## Buy Request

`POST`

/contracts/{contract_id}/buy-request

Response: 

```
{
    "address": "1Hz96kJKF2HLPGY15JWLB5m9qGNxvt8tHJ",
    "amount": "3.33",
    "access_token": "a989as0dfhfhshwwr37fh56sdfsi909kja0f9kas0dfas0ja0djfas9ias09k3414auyjjh09aks-a=sdfasdf-@",
    "request_id": "5976f5c7cfa1624c2909ab4d"
}
```

## Is Paid

`GET`

/contracts/{contract_id}/is-paid/by-request-id?request_id=<request_id>
/contracts/{contract_id}/is-paid/by-address?addresses[]=<check_address>

Response: 

```
{
    "contract_id": "8a9d8f98as989s8dfak9a9k",
    "request_id": "5976f5c7cfa1624c2909ab4d",
    "amount": "3.33",
    "payed_at": "2017-07-25T08:00:16.000Z",
    "from_addresses": [
        "1Hz96kJKF2HLPGY15JWLB5m9qGNxvt8tHJ"
    ]
}
```

## Source code

`POST`

/contracts/{contract_id}/source-code

Request: 

```
{
    "request_id": "5976f5c7cfa1624c2909ab4d",
    "access_token": "a989as0dfhfhshwwr37fh56sdfsi909kja0f9kas0dfas0ja0djfas9ias09k3414auyjjh09aks-a=sdfasdf-@"
}
```


Response: 

```
    {
        "bytecode": String
    }
```

## Bytecode

`POST`

/contracts/{contract_id}/bytecode

Request: 

```
{
    "buyer_addresses": [
        "1Hz96kJKF2HLPGY15JWLB5m9qGNxvt8tHJ"
    ],
    "nonce": 1498736970,
    "signs": [
        "0320390741d655389f20904a41d655389e2540ff092f4542312f4144362f2f4254432e544f502f4e59412ffabe6d6d82d4592133163f9a904a326a4d57dfa19748074f0b7a69fd0c164593481e60a3010000000000000009392bffdb25924800000000"
    ]
}
```

Response: 

```
    {
        "source_code": String
    }
```
