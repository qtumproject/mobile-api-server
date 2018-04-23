## Table of Contents

* [API](#api)
    * [Contracts / Call](#contracts-call)
    * [Contracts / Encoder](#contracts-encoder)
    * [Contracts / Generate token bytecode](#contracts-generate-token-bytecode)
    * [Contracts / Params](#contracts-params)
    * [Send Raw Transaction](#send-raw-transactions)
    * [Get Transaction](#get-transaction)
    * [Get Transaction Receipt](#get-transaction-receipt)
    * [Get History](#get-history)
    * [Get History for several addresses](#get-history-for-several-addresses)
    * [Get unspent outputs](#get-unspent-outputs)
    * [Get unspent outputs for several addresses](#get-unspent-outputs-for-several-addresses)
    * [Get news](#get-news)
    * [Get blockchain info](#get-blockchain-info)
    * [Get dgp info](#get-dgp-info)
    * [Estimate Fee Per Kb](#estimate-fee-per-kb)
    * [QRC20 Transfers](#qrc20-transfers)
    * [Does Contract exist?](#does-contract-exist)
    
* [Web Socket API](#web-socket-api)

* [QStore API](#qstore-api)
    * [Trending now](#trending-now)
    * [Last added](#last-added)
    * [Contract search](#contract-search)
    * [Contract](#contract)
    * [Contract ABI](#contract-abi)
    * [Buy Request](#buy-request)
    * [Is Paid](#is-paid)
    * [Source code](#source-code)
    * [Bytecode](#bytecode)
    * [Types (Categories)](#types-categories)
    
    
* [Web Socket QStore API](#web-socket-qstore-api)

# API


## Contracts / Call
`POST`

/contracts/{addressContract}/call

Request
```
{
	"hashes": [String, String, ...],
	"from": ?String
}
```

Response
```
{
    "outputs": [
          {
             "hash": String,
             "output": String,
             "gas_used": Integer
             "excepted": String
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

response: Object | null

```
{
	"symbol": String,
	"decimals": String,
	"name": String,
	"totalSupply": String
}
```

## Send Raw Transaction
`POST`

/send-raw-transaction

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

response: Object | null

confirmed with contract | call

```

{
    "block_time": 1523607152,
    "block_height": 121249,
    "block_hash": "bf72cb4c0c5628a8a698fd25e7133cb42c4abef9992acb9b29f1b404b8269291",
    "tx_time": 1523607152,
    "tx_hash": "bcac37912335658ad4c63647d6e1fe75827069cc14acf49726184d617e5a687a",
    "amount": 58.1674528,
    "vout": [
        {
            "value": "56.7627008",
            "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5",
            "scriptPubKey": "OP_DUP OP_HASH160 568c90426d58a31048dcaf84d321c1e2f0bc4602 OP_EQUALVERIFY OP_CHECKSIG"
        },
        {
            "value": "0",
            "address": "qQ2Zee1FPMzStBLoHZeEcgrkgvyZnaYRu3",
            "scriptPubKey": "4 3500000 40 b7b6d822000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc460254696d2044726170657220707265646963746564204254432070726963652077696c6c20676f206265796f6e64203235306b20646f6c6c61727320627920323032302c20646f20796f75207468696e6b20736f3f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000079657320000000000000000000000000000000000000000000000000000000006e6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005ad06830000000000000000000000000000000000000000000000000000000005ad12608000000000000000000000000000000000000000000000000000000005ad12644000000000000000000000000000000000000000000000000000000005ad13490 46f4beb70f29eec9d9fa21243ce9bfcf919a9b66 OP_CALL"
        }
    ],
    "vin": [
        {
            "value": "0.2351468",
            "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5"
        },
        {
            "value": "57.932306",
            "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5"
        }
    ],
    "receipt": [
        {
            "blockHash": "bf72cb4c0c5628a8a698fd25e7133cb42c4abef9992acb9b29f1b404b8269291",
            "blockNumber": 121249,
            "transactionHash": "bcac37912335658ad4c63647d6e1fe75827069cc14acf49726184d617e5a687a",
            "transactionIndex": 2,
            "from": "568c90426d58a31048dcaf84d321c1e2f0bc4602",
            "to": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
            "cumulativeGasUsed": 2895910,
            "gasUsed": 2895910,
            "contractAddress": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
            "excepted": "None",
            "log": [
                {
                    "address": "f6177bc9812eeb531907621af6641a41133dea9e",
                    "topics": [
                        "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                        "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602",
                        "000000000000000000000000b290a728b75d21188ee3a1166163fe2f1f898cf5"
                    ],
                    "data": "000000000000000000000000000000000000000000000000000000003b9aca00"
                },
                {
                    "address": "b290a728b75d21188ee3a1166163fe2f1f898cf5",
                    "topics": [
                        "85e097789c3ac56c0d1376d977138b099d5ccbdf055680a82bb03e6fb52bcbe8",
                        "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602"
                    ],
                    "data": "000000000000000000000000000000000000000000000000000000003b9aca00"
                },
                {
                    "address": "e944bf7652e836285ee80046e2e7502f2f91b10f",
                    "topics": [
                        "1e482c6081e57445e988bc379f3066a27d0db9fb8d6c9fb9aeff950cec4c1897",
                        "0000000000000000000000000000000000000000000000000000000000000000",
                        "000000000000000000000000046a25097eedb67fca67cb35720b6454ce61440c",
                        "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6"
                    ],
                    "data": "0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602000000000000000000000000000000000000000000000000000000005ad06830000000000000000000000000000000000000000000000000000000005ad12608000000000000000000000000000000000000000000000000000000005ad12644000000000000000000000000000000000000000000000000000000005ad1349000000000000000000000000000000000000000000000000000000002540be400"
                },
                {
                    "address": "b290a728b75d21188ee3a1166163fe2f1f898cf5",
                    "topics": [
                        "b7269578552456138d47dc37471d94886205143f138387446eff0148047965f6",
                        "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6"
                    ],
                    "data": ""
                },
                {
                    "address": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
                    "topics": [
                        "c2062da3024306c805e1149341bc0a66d3d5056315ddb24eefb5cf9ff2e30111",
                        "0000000000000000000000000000000000000000000000000000000000000000",
                        "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6",
                        "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602"
                    ],
                    "data": "54696d2044726170657220707265646963746564204254432070726963652077696c6c20676f206265796f6e64203235306b20646f6c6c61727320627920323032302c20646f20796f75207468696e6b20736f3f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000496e76616c69640000000000000000000000000000000000000000000000000079657320000000000000000000000000000000000000000000000000000000006e6f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000003b9aca00"
                }
            ]
        }
    ]
}
```

without contract call | create

```
{
    "block_time": 1491219489|null,
    "block_height": 31111|-1,
    "block_hash": "b0589be37f4e24bffea77bfc87f5bbd6f9a90c629306f7c3340c7c52a982e592"|null,
    "tx_hash": "25fb98d4849f837d71f331eec74f71e9286e6a0b85d27218f7236dc69d8c990f",
    "amount": 5, //qtum,
    "contract_has_been_created": true, //optional
    "contract_has_been_deleted": true, //optional
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

## Get Transaction Receipt

`GET`

/transactions/:txhash/receipt

response: Array

```
[
    {
        "blockHash": "0916253e64ca802cbe29329144a10d73179fd84f118b0ef5c68e4e43276e1827",
        "blockNumber": 6964,
        "transactionHash": "073edd4537fda626fb351b25324e1ad69446cf7d489ebfdb6161f86df1f77aec",
        "transactionIndex": 2,
        "from": "d9826270f3bee3b792455ff5d1d1cd4432e6a5fa",
        "to": "588573c01ddcca8844aed7f762ab36b35cc6084e",
        "cumulativeGasUsed": 51805,
        "gasUsed": 51805,
        "contractAddress": "588573c01ddcca8844aed7f762ab36b35cc6084e",
        "log": [
            {
                "address": "588573c01ddcca8844aed7f762ab36b35cc6084e",
                "topics": [
                    "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "000000000000000000000000d9826270f3bee3b792455ff5d1d1cd4432e6a5fa",
                    "00000000000000000000000004b13b89eae779f791d298a306a763230d283337"
                ],
                "data": "00000000000000000000000000000000000000000000000000000000000001f4"
            }
        ]
    }
]
```

## Get History
`GET`

/history/{address}/{limit}/{offset}

> `MAX_LIMIT = 50;`

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
                     "address": "mr8Mezn8p7CmHvPBbfieSxfeNtHiG7AwfQ",
                     "scriptPubKey": "4 400d030000000000 2800000000000000 a9059cbb0000000000000000000000002650f3a876b1f3ffd9766c381660cf946ee5237a0000000000000000000000000000000000000000000000000000000000000001 4545fc7b7e2bb7604027835f5b88427e40150aff OP_CALL"
                 },
                 {
                     "value": "0.874", //qtum
                     "address": "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3",
                     "scriptPubKey": "4 400d030000000000 2800000000000000 a9059cbb0000000000000000000000002650f3a876b1f3ffd9766c381660cf946ee5237a0000000000000000000000000000000000000000000000000000000000000001 4545fc7b7e2bb7604027835f5b88427e40150aff OP_CALL"
                 }
             ],
             "vin": [
                 {
                     value: "1.875", //qtum
                     address: "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
                 }
             ]
         },
         {
            "block_time": 1523607152,
            "block_height": 121249,
            "block_hash": "bf72cb4c0c5628a8a698fd25e7133cb42c4abef9992acb9b29f1b404b8269291",
            "tx_time": 1523607152,
            "tx_hash": "bcac37912335658ad4c63647d6e1fe75827069cc14acf49726184d617e5a687a",
            "amount": 58.1674528,
            "vout": [
                {
                    "value": "56.7627008",
                    "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5",
                    "scriptPubKey": "OP_DUP OP_HASH160 568c90426d58a31048dcaf84d321c1e2f0bc4602 OP_EQUALVERIFY OP_CHECKSIG"
                },
                {
                    "value": "0",
                    "address": "qQ2Zee1FPMzStBLoHZeEcgrkgvyZnaYRu3",
                    "scriptPubKey": "4 3500000 40 b7b6d822000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc460254696d2044726170657220707265646963746564204254432070726963652077696c6c20676f206265796f6e64203235306b20646f6c6c61727320627920323032302c20646f20796f75207468696e6b20736f3f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000079657320000000000000000000000000000000000000000000000000000000006e6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005ad06830000000000000000000000000000000000000000000000000000000005ad12608000000000000000000000000000000000000000000000000000000005ad12644000000000000000000000000000000000000000000000000000000005ad13490 46f4beb70f29eec9d9fa21243ce9bfcf919a9b66 OP_CALL"
                }
            ],
            "vin": [
                {
                    "value": "0.2351468",
                    "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5"
                },
                {
                    "value": "57.932306",
                    "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5"
                }
            ],
            "receipt": [
                {
                    "blockHash": "bf72cb4c0c5628a8a698fd25e7133cb42c4abef9992acb9b29f1b404b8269291",
                    "blockNumber": 121249,
                    "transactionHash": "bcac37912335658ad4c63647d6e1fe75827069cc14acf49726184d617e5a687a",
                    "transactionIndex": 2,
                    "from": "568c90426d58a31048dcaf84d321c1e2f0bc4602",
                    "to": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
                    "cumulativeGasUsed": 2895910,
                    "gasUsed": 2895910,
                    "contractAddress": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
                    "excepted": "None",
                    "log": [
                        {
                            "address": "f6177bc9812eeb531907621af6641a41133dea9e",
                            "topics": [
                                "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602",
                                "000000000000000000000000b290a728b75d21188ee3a1166163fe2f1f898cf5"
                            ],
                            "data": "000000000000000000000000000000000000000000000000000000003b9aca00"
                        },
                        {
                            "address": "b290a728b75d21188ee3a1166163fe2f1f898cf5",
                            "topics": [
                                "85e097789c3ac56c0d1376d977138b099d5ccbdf055680a82bb03e6fb52bcbe8",
                                "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602"
                            ],
                            "data": "000000000000000000000000000000000000000000000000000000003b9aca00"
                        },
                        {
                            "address": "e944bf7652e836285ee80046e2e7502f2f91b10f",
                            "topics": [
                                "1e482c6081e57445e988bc379f3066a27d0db9fb8d6c9fb9aeff950cec4c1897",
                                "0000000000000000000000000000000000000000000000000000000000000000",
                                "000000000000000000000000046a25097eedb67fca67cb35720b6454ce61440c",
                                "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6"
                            ],
                            "data": "0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602000000000000000000000000000000000000000000000000000000005ad06830000000000000000000000000000000000000000000000000000000005ad12608000000000000000000000000000000000000000000000000000000005ad12644000000000000000000000000000000000000000000000000000000005ad1349000000000000000000000000000000000000000000000000000000002540be400"
                        },
                        {
                            "address": "b290a728b75d21188ee3a1166163fe2f1f898cf5",
                            "topics": [
                                "b7269578552456138d47dc37471d94886205143f138387446eff0148047965f6",
                                "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6"
                            ],
                            "data": ""
                        },
                        {
                            "address": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
                            "topics": [
                                "c2062da3024306c805e1149341bc0a66d3d5056315ddb24eefb5cf9ff2e30111",
                                "0000000000000000000000000000000000000000000000000000000000000000",
                                "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6",
                                "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602"
                            ],
                            "data": "54696d2044726170657220707265646963746564204254432070726963652077696c6c20676f206265796f6e64203235306b20646f6c6c61727320627920323032302c20646f20796f75207468696e6b20736f3f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000496e76616c69640000000000000000000000000000000000000000000000000079657320000000000000000000000000000000000000000000000000000000006e6f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000003b9aca00"
                        }
                    ]
                }
            ]
        }
    ]
}
```

## Get History for several addresses
`GET`
 
/history/{limit}/{offset}?addresses[]={:address}&addresses[]={:address2}

> `MAX_LIMIT = 50;`

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
                     "address": "mr8Mezn8p7CmHvPBbfieSxfeNtHiG7AwfQ",
                     "scriptPubKey": "4 400d030000000000 2800000000000000 a9059cbb0000000000000000000000002650f3a876b1f3ffd9766c381660cf946ee5237a0000000000000000000000000000000000000000000000000000000000000001 4545fc7b7e2bb7604027835f5b88427e40150aff OP_CALL"
                 },
                 {
                     "value": "0.874", //qtum
                     "address": "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3",
                     "scriptPubKey": "4 400d030000000000 2800000000000000 a9059cbb0000000000000000000000002650f3a876b1f3ffd9766c381660cf946ee5237a0000000000000000000000000000000000000000000000000000000000000001 4545fc7b7e2bb7604027835f5b88427e40150aff OP_CALL"
                 }
             ],
             "vin": [
                 {
                     value: "1.875", //qtum
                     address: "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3"
                 }
             ]
         },
         {
            "block_time": 1523607152,
            "block_height": 121249,
            "block_hash": "bf72cb4c0c5628a8a698fd25e7133cb42c4abef9992acb9b29f1b404b8269291",
            "tx_time": 1523607152,
            "tx_hash": "bcac37912335658ad4c63647d6e1fe75827069cc14acf49726184d617e5a687a",
            "amount": 58.1674528,
            "vout": [
                {
                    "value": "56.7627008",
                    "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5",
                    "scriptPubKey": "OP_DUP OP_HASH160 568c90426d58a31048dcaf84d321c1e2f0bc4602 OP_EQUALVERIFY OP_CHECKSIG"
                },
                {
                    "value": "0",
                    "address": "qQ2Zee1FPMzStBLoHZeEcgrkgvyZnaYRu3",
                    "scriptPubKey": "4 3500000 40 b7b6d822000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc460254696d2044726170657220707265646963746564204254432070726963652077696c6c20676f206265796f6e64203235306b20646f6c6c61727320627920323032302c20646f20796f75207468696e6b20736f3f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000079657320000000000000000000000000000000000000000000000000000000006e6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005ad06830000000000000000000000000000000000000000000000000000000005ad12608000000000000000000000000000000000000000000000000000000005ad12644000000000000000000000000000000000000000000000000000000005ad13490 46f4beb70f29eec9d9fa21243ce9bfcf919a9b66 OP_CALL"
                }
            ],
            "vin": [
                {
                    "value": "0.2351468",
                    "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5"
                },
                {
                    "value": "57.932306",
                    "address": "qRT1f426itBm1Ci1XobRHs7gReS2DdD4P5"
                }
            ],
            "receipt": [
                {
                    "blockHash": "bf72cb4c0c5628a8a698fd25e7133cb42c4abef9992acb9b29f1b404b8269291",
                    "blockNumber": 121249,
                    "transactionHash": "bcac37912335658ad4c63647d6e1fe75827069cc14acf49726184d617e5a687a",
                    "transactionIndex": 2,
                    "from": "568c90426d58a31048dcaf84d321c1e2f0bc4602",
                    "to": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
                    "cumulativeGasUsed": 2895910,
                    "gasUsed": 2895910,
                    "contractAddress": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
                    "excepted": "None",
                    "log": [
                        {
                            "address": "f6177bc9812eeb531907621af6641a41133dea9e",
                            "topics": [
                                "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602",
                                "000000000000000000000000b290a728b75d21188ee3a1166163fe2f1f898cf5"
                            ],
                            "data": "000000000000000000000000000000000000000000000000000000003b9aca00"
                        },
                        {
                            "address": "b290a728b75d21188ee3a1166163fe2f1f898cf5",
                            "topics": [
                                "85e097789c3ac56c0d1376d977138b099d5ccbdf055680a82bb03e6fb52bcbe8",
                                "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602"
                            ],
                            "data": "000000000000000000000000000000000000000000000000000000003b9aca00"
                        },
                        {
                            "address": "e944bf7652e836285ee80046e2e7502f2f91b10f",
                            "topics": [
                                "1e482c6081e57445e988bc379f3066a27d0db9fb8d6c9fb9aeff950cec4c1897",
                                "0000000000000000000000000000000000000000000000000000000000000000",
                                "000000000000000000000000046a25097eedb67fca67cb35720b6454ce61440c",
                                "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6"
                            ],
                            "data": "0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602000000000000000000000000000000000000000000000000000000005ad06830000000000000000000000000000000000000000000000000000000005ad12608000000000000000000000000000000000000000000000000000000005ad12644000000000000000000000000000000000000000000000000000000005ad1349000000000000000000000000000000000000000000000000000000002540be400"
                        },
                        {
                            "address": "b290a728b75d21188ee3a1166163fe2f1f898cf5",
                            "topics": [
                                "b7269578552456138d47dc37471d94886205143f138387446eff0148047965f6",
                                "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6"
                            ],
                            "data": ""
                        },
                        {
                            "address": "46f4beb70f29eec9d9fa21243ce9bfcf919a9b66",
                            "topics": [
                                "c2062da3024306c805e1149341bc0a66d3d5056315ddb24eefb5cf9ff2e30111",
                                "0000000000000000000000000000000000000000000000000000000000000000",
                                "0000000000000000000000001138d85e90cf426c707e3d01969d56600fcfa1b6",
                                "000000000000000000000000568c90426d58a31048dcaf84d321c1e2f0bc4602"
                            ],
                            "data": "54696d2044726170657220707265646963746564204254432070726963652077696c6c20676f206265796f6e64203235306b20646f6c6c61727320627920323032302c20646f20796f75207468696e6b20736f3f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000496e76616c69640000000000000000000000000000000000000000000000000079657320000000000000000000000000000000000000000000000000000000006e6f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000003b9aca00"
                        }
                    ]
                }
            ]
        }
    ]
}
```

## Get unspent outputs
`GET`

/outputs/unspent/{address}

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

## Get dgp info

`GET`

/blockchain/dgpinfo

response
```
{
    maxblocksize: 2000000,
    blockgaslimit: 40,
    mingasprice: 40000000
}
```


## Estimate Fee Per Kb

`GET`

/estimate-fee-per-kb[?nBlocks=2]

Response: 

```
   {
       fee_per_kb: 0.00001
   }
```


## QRC20 Transfers

`GET`

/qrc20/{:qrc20ContractAddress}/transfers?limit=20&offset=0&addresses[]=QMo91KVCAW9BMAeHRDYz5ib94N7pGTMmQd&withReceipt=true

If you dont want to get receipt, then do not add withReceipt field to query

Response:
```
{
    "limit": 20,
    "offset": 0,
    "count": 2,
    "items": [
       {
            "from": "qVa4Pp5fjrLNdEzHM882F5hZnWMMPJCu7W",
            "to": "qVa4Pp5fjrLNdEzHM882F5hZnWMMPJCu7W",
            "amount": "120000000000000000000000000000000000000000",
            "tx_hash": "e95cc08e65b626f0d9b36d452a7580c14ec75be2c078f7c155a7233f823239ae",
            "tx_time": 1518525456,
            "contract_address": "84447378b80baf144377a393aabcd8a61007c0e8",
            "receipt": [
                {
                    "blockHash": "36d582085290dc43be4253ebc69d7eda596cbfc3a492b4b4b8877beffbf49a00",
                    "blockNumber": 86145,
                    "transactionHash": "e95cc08e65b626f0d9b36d452a7580c14ec75be2c078f7c155a7233f823239ae",
                    "transactionIndex": 2,
                    "from": "83c2436854450b0895d4c1d965720ef5e6a125be",
                    "to": "84447378b80baf144377a393aabcd8a61007c0e8",
                    "cumulativeGasUsed": 36923,
                    "gasUsed": 36923,
                    "contractAddress": "84447378b80baf144377a393aabcd8a61007c0e8",
                    "excepted": "None",
                    "log": [
                        {
                            "address": "84447378b80baf144377a393aabcd8a61007c0e8",
                            "topics": [
                                "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                "00000000000000000000000083c2436854450b0895d4c1d965720ef5e6a125be",
                                "00000000000000000000000083c2436854450b0895d4c1d965720ef5e6a125be"
                            ],
                            "data": "00000000000000000000000000000160a5f7552857b8fc0cb7808c0000000000"
                        }
                    ]
                }
            ]
        },
        {
            "from": "qVa4Pp5fjrLNdEzHM882F5hZnWMMPJCu7W",
            "to": "qSZSyHjzHhqRYmsFLC1pWGA5jnuPzjB9gb",
            "amount": "2220000000000000000000000000000000000000000",
            "tx_hash": "2ebf4ec2df9a0e8b617681afe703b7ffe2d076c45b2c726fe1a6b0ffd665f599",
            "tx_time": 1516880768,
            "contract_address": "84447378b80baf144377a393aabcd8a61007c0e8",
            "receipt": [
                {
                    "blockHash": "818d571cab4f0b6f1f425767245719f219614ad5aa0a6da7d2eded68e3f9c72d",
                    "blockNumber": 74751,
                    "transactionHash": "2ebf4ec2df9a0e8b617681afe703b7ffe2d076c45b2c726fe1a6b0ffd665f599",
                    "transactionIndex": 3,
                    "from": "83c2436854450b0895d4c1d965720ef5e6a125be",
                    "to": "84447378b80baf144377a393aabcd8a61007c0e8",
                    "cumulativeGasUsed": 103206,
                    "gasUsed": 51923,
                    "contractAddress": "84447378b80baf144377a393aabcd8a61007c0e8",
                    "excepted": "None",
                    "log": [
                        {
                            "address": "84447378b80baf144377a393aabcd8a61007c0e8",
                            "topics": [
                                "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                "00000000000000000000000083c2436854450b0895d4c1d965720ef5e6a125be",
                                "00000000000000000000000062bc51052a584450e820844cc8b648842439d77b"
                            ],
                            "data": "0000000000000000000000000000197bfe5fa76a56de36eb42ca1e0000000000"
                        }
                    ]
                }
            ]
        },
    ]
}
```

## Does Contract exist?

`GET`

/contracts/{:contractAddress}/exists

Response:

```
    {
        "exists": Boolean
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
    "tx_time": 1490705700, // tx_time === block_time if transaction is uncluded in block
    "amount": 1.875, //qtum
    "contract_has_been_deleted": true, //optional
    "vout": [
        {
            "value": "1", //qtum
            "address": "mr8Mezn8p7CmHvPBbfieSxfeNtHiG7AwfQ",
            "scriptPubKey": "4 400d030000000000 2800000000000000 a9059cbb0000000000000000000000002650f3a876b1f3ffd9766c381660cf946ee5237a0000000000000000000000000000000000000000000000000000000000000001 4545fc7b7e2bb7604027835f5b88427e40150aff OP_CALL"
        },
        {
            "value": "0.874", //qtum
            "address": "mvYtoXgd5NCWNfPmyH8AYDyzY6kqmZ5Jt3",
            "scriptPubKey": "4 400d030000000000 2800000000000000 a9059cbb0000000000000000000000002650f3a876b1f3ffd9766c381660cf946ee5237a0000000000000000000000000000000000000000000000000000000000000001 4545fc7b7e2bb7604027835f5b88427e40150aff OP_CALL"
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

```
{
  "block_time": 1523613824,
  "block_height": 121294,
  "block_hash": "f4183db5f706d928b2b49654ddb81307e8b5bc3aada86ce4db840668be983204",
  "tx_time": 1523613824,
  "tx_hash": "795c147c97f3b75df0ed81fd0938bf3a5b02cbd3eb7c0935a7c9d6d6b53f6b2f",
  "amount": 3,
  "vout": [
    {
      "value": "2.1",
      "address": "qV7Tb9FRxRi7QY1P9vAv9tv4eio5zHBFFV",
      "scriptPubKey": "OP_DUP OP_HASH160 7eba6514c525e50a265347672bca6abafec10409 OP_EQUALVERIFY OP_CHECKSIG"
    }
  ],
  "vin": [
    {
      "value": "3",
      "address": "qV7Tb9FRxRi7QY1P9vAv9tv4eio5zHBFFV"
    }
  ],
  "receipt": [
    {
      "blockHash": "f4183db5f706d928b2b49654ddb81307e8b5bc3aada86ce4db840668be983204",
      "blockNumber": 121294,
      "transactionHash": "795c147c97f3b75df0ed81fd0938bf3a5b02cbd3eb7c0935a7c9d6d6b53f6b2f",
      "transactionIndex": 6,
      "from": "7eba6514c525e50a265347672bca6abafec10409",
      "to": "0000000000000000000000000000000000000000",
      "cumulativeGasUsed": 7485154,
      "gasUsed": 1062447,
      "contractAddress": "203d99eb9c935cc1fd35b574275bdfd788eb7cf6",
      "excepted": "None",
      "log": [
        {
          "address": "203d99eb9c935cc1fd35b574275bdfd788eb7cf6",
          "topics": [
            "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "0000000000000000000000007eba6514c525e50a265347672bca6abafec10409"
          ],
          "data": "00000000000000000000000000000000000000000000000000000000000003e8"
        }
      ]
    }
  ],
  "contract_has_been_created": true
}

```

### Event ``new_token_transaction``


Listen:

```
    socket.on('new_token_transaction', function(data) {
         console.log(data) // Sample output
    });
```

Sample output:

```
{
  "block_time": 1523613824,
  "block_height": 121294,
  "block_hash": "f4183db5f706d928b2b49654ddb81307e8b5bc3aada86ce4db840668be983204",
  "tx_time": 1523613824,
  "tx_hash": "795c147c97f3b75df0ed81fd0938bf3a5b02cbd3eb7c0935a7c9d6d6b53f6b2f",
  "amount": 3,
  "vout": [
    {
      "value": "2.1",
      "address": "qV7Tb9FRxRi7QY1P9vAv9tv4eio5zHBFFV",
      "scriptPubKey": "OP_DUP OP_HASH160 7eba6514c525e50a265347672bca6abafec10409 OP_EQUALVERIFY OP_CHECKSIG"
    }
  ],
  "vin": [
    {
      "value": "3",
      "address": "qV7Tb9FRxRi7QY1P9vAv9tv4eio5zHBFFV"
    }
  ],
  "receipt": [
    {
      "blockHash": "f4183db5f706d928b2b49654ddb81307e8b5bc3aada86ce4db840668be983204",
      "blockNumber": 121294,
      "transactionHash": "795c147c97f3b75df0ed81fd0938bf3a5b02cbd3eb7c0935a7c9d6d6b53f6b2f",
      "transactionIndex": 6,
      "from": "7eba6514c525e50a265347672bca6abafec10409",
      "to": "0000000000000000000000000000000000000000",
      "cumulativeGasUsed": 7485154,
      "gasUsed": 1062447,
      "contractAddress": "203d99eb9c935cc1fd35b574275bdfd788eb7cf6",
      "excepted": "None",
      "log": [
        {
          "address": "203d99eb9c935cc1fd35b574275bdfd788eb7cf6",
          "topics": [
            "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "0000000000000000000000007eba6514c525e50a265347672bca6abafec10409"
          ],
          "data": "00000000000000000000000000000000000000000000000000000000000003e8"
        }
      ]
    }
  ],
  "contract_has_been_created": true
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


## Trending now

`GET`

/contracts/trending-now 

Response: 

```
[{
    "id": "8a9d8f98as989s8dfak9a9k",
    "name": "Contract name",
    "type": "Crowdsale", // QRC20 Token || Crowdsale || Smart Contract
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
    "type": "Crowdsale", // QRC20 Token || Crowdsale || Smart Contract
    "price": "4.3432344", // cost in QTUM
    "count_buy": 3,
    "count_downloads": 323,
    "created_at": "2017-07-18T09:37:06.193Z"
}, ...]
```

## Contract search

`GET`

/contracts/{count}/{offset}?type={type_name}&tags[]={tag}&name={name}

Response: 

```
[{
    "id": "8a9d8f98as989s8dfak9a9k",
    "name": "Contract name",
    "type": "Crowdsale", // QRC20 Token || Crowdsale || Smart Contract
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
    "type": "Crowdsale", // QRC20 Token || Crowdsale || Smart Contract
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

/contracts/{contract_id}/is-paid/by-request-id?request_id={request_id}

`GET`

/contracts/{contract_id}/is-paid/by-address?addresses[]={check_address}

Response: 

```
{
    "contract_id": "8a9d8f98as989s8dfak9a9k",
    "request_id": "5976f5c7cfa1624c2909ab4d",
    "amount": "3.33",
    "payed_at": "2017-07-25T08:00:16.000Z",
    "created_at": "2017-07-25T08:00:16.000Z",
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

## Types (Categories)

`GET`

/contracts/types

Response: 

```
[
    {
        _id: "Crowdsale",
        type: "Crowdsale",
        count: 1
    },
    ...
]
```


# Web Socket QStore API

### Event ``contract_purchase``

Subscribe:

```
    socket.emit('subscribe', 'contract_purchase', requestId<String>);
```


Unsubscribe:

```
    socket.emit('unsubscribe', 'contract_purchase', requestId<String>);
```

or 

```
    socket.emit('unsubscribe', 'contract_purchase');
```

Listen:
```
    socket.on('contract_purchase', function(data) {
         //Sample output
    });
```

Sample output:

```
{
    "contract_id": "8a9d8f98as989s8dfak9a9k",
    "request_id": "5976f5c7cfa1624c2909ab4d",
    "amount": "3.33",
    "payed_at": "2017-07-25T08:00:16.000Z",
    "created_at": "2017-07-25T08:00:16.000Z",
    "from_addresses": [
        "1Hz96kJKF2HLPGY15JWLB5m9qGNxvt8tHJ"
    ]
}
```
