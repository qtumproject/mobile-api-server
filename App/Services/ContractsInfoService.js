const InsightApi = require("../Repositories/InsightApi");
const SolidityCoder = require('../Components/Solidity/SolidityCoder');
const async = require('async');
const SolidityParamCreator = require('../Components/Solidity/SolidityParamCreator');

class ContractsInfoService {

    constructor(solidityInterface, functionHashes) {
        this.interface = solidityInterface;
        this.functionHashes = functionHashes;
        this.findedFields = {};
        this.solidities = {};
        this.paramCreator = new SolidityParamCreator(this.interface, this.functionHashes);
    }

    fetchInfoBySolidityParams(contractAddress, args, cb) {
        let result = {};

        async.each(args, (param, callback) => {

            this.call(contractAddress, param, (err, data) => {

                if (err) {
                    return callback(err);
                }

                result[param.paramName] = data;

                callback();
            });
        }, (err) => {

            if (err) {
                return cb(null, null);
            }

            return cb(null, result);

        });

    }

    call(contractAddress, param, callback) {

        let result;

        InsightApi.callContract(contractAddress, param.hash, (err, data) => {

            try {

                let solidity = this._getSolidityInterfaceEncoder(param.paramName);

                result = solidity.unpackOutput(data.output);

                switch (param.type) {
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

    _getSolidityInterfaceEncoder(fieldName) {

        if (!this.solidities[fieldName]) {
            this.solidities[fieldName] = new SolidityCoder(this.interface.find((itemInterface) => {
                return itemInterface.name === fieldName;
            }));
        }

        return this.solidities[fieldName];

    }

    createParam(paramName, paramDataArray) {
        return this.paramCreator.createParam(paramName, paramDataArray)
    }

}

module.exports = ContractsInfoService;