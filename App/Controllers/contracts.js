const async = require('async');
const ContractsGenerator = require("../Services/ContractsGenerator");
const InsightApi = require("../Repositories/InsightApi");
const logger = require('log4js').getLogger('Contracts Controller');
const SolidityEncoder = require('../Components/Solidity/SolidityEncoder');
const MyTokenData = require('../Components/ContractData/MyTokenData');

let Controllers = getControllers();

class ContractsController {

    constructor() {
        logger.info('Init');
        this.solidities = {};
    }

    generateTokenBytecode(cb, data) {

        try {

            let tokens = ContractsGenerator.generateToken({
                initialSupply: data._post.initialSupply,
                tokenName: data._post.tokenName,
                decimalUnits: data._post.decimalUnits,
                tokenSymbol: data._post.tokenSymbol
            });

            cb(null, tokens);

        } catch (e) {
            cb(e.message, null);
        }

    }

    fetchContractParams(cb, data) {

        let req = data.req,
            symbolHash = MyTokenData.functionHashes['symbol()'],
            decimalsHash = MyTokenData.functionHashes['decimals()'],
            nameHash = MyTokenData.functionHashes['name()'],
            result = {};

        async.eachSeries([{index: 'symbol', hash: symbolHash, type: "String"}, {index: 'decimals', hash: decimalsHash, type: "Integer"}, {index: 'name', hash: nameHash, type: "String"}], (item, callback) => {

            InsightApi.callContract(req.params.contractAddress, item.hash, (err, data) => {

                try {

                    let solidity = this._getSolidityInterfaceEncoder(item.index);
                    result[item.index] = solidity.unpackOutput(data.output);

                    switch (item.type) {
                        case "Integer":
                            result[item.index] = parseInt(result[item.index]);
                    }

                } catch (e) {
                    return callback(e.message);
                }

                return callback(err, data);

            });

        }, (err) => {

            if (err) {
                return cb(null, null);
            }

            return cb(null, result);

        });

    }

    _getSolidityInterfaceEncoder(fieldName) {

        if (!this.solidities[fieldName]) {
            this.solidities[fieldName] = new SolidityEncoder(MyTokenData.interface.find((itemInterface) => {
                return itemInterface.name === fieldName;
            }));
        }

        return this.solidities[fieldName];

    }
}

Controllers.contracts = new ContractsController();