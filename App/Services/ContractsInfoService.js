const InsightApi = require("../Repositories/InsightApi");
const SolidityEncoder = require('../Components/Solidity/SolidityEncoder');
const async = require('async');

class ContractsInfoService {

    constructor(solidityInterface, functionHashes) {
        this.interface = solidityInterface;
        this.functionHashes = functionHashes;
        this.findedFields = {};
        this.solidities = {};
    }

    fetchInfoByParams(contractAddress, paramNames, cb) {

        let result = {};

        async.each(this.getParamsFromInterface(paramNames, this.interface, this.functionHashes), (item, callback) => {

            this.callContract(contractAddress, item, (err, data) => {

                if (err) {
                    return callback(err);
                }

                result[item.param] = data;

                callback();
            });

        }, (err) => {

            if (err) {
                return cb(null, null);
            }

            return cb(null, result);

        });
    }

    callContract(contractAddress, item, callback) {

        let result;

        InsightApi.callContract(contractAddress, item.hash, (err, data) => {

            try {

                let solidity = this._getSolidityInterfaceEncoder(item.param);

                result = solidity.unpackOutput(data.output);

                switch (item.type) {
                    case "uint8":
                    case "uint256":
                        result = parseInt(result);
                }

            } catch (e) {
                return callback(e.message);
            }

            return callback(err, result);

        });

    }

    getParamsFromInterface(paramNames, solidityInterface, functionHashes) {
        let result = [];

        paramNames.forEach((paramName) => {

            if (!this.findedFields[paramName]) {
                this.findedFields[paramName] = ContractsInfoService.findFieldInInterface(paramName, solidityInterface);
            }

            let field = this.findedFields[paramName];

            if (!field) {
                 throw new Error('Wrong interface or param name');
            }

            let functionHashesKeys = Object.keys(functionHashes),
                hashKey = functionHashesKeys.find((hash) => {
                    return hash.replace(/\(.*\)/,'') === paramName;
                });

            result.push({
                param: paramName,
                type: field['outputs'][0]['type'],
                hash: functionHashes[hashKey]
            });

        });

        return result;
    }

    static findFieldInInterface(fieldName, solidityInterface) {
        return solidityInterface.find((itemInterface) => {
            return itemInterface.name === fieldName;
        });
    }


    _getSolidityInterfaceEncoder(fieldName) {

        if (!this.solidities[fieldName]) {
            this.solidities[fieldName] = new SolidityEncoder(this.interface.find((itemInterface) => {
                return itemInterface.name === fieldName;
            }));
        }

        return this.solidities[fieldName];

    }

}

module.exports = ContractsInfoService;