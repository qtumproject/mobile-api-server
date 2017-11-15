const InsightApiRepository = require("../Repositories/InsightApiRepository");
const SolidityCoder = require('../Components/Solidity/SolidityCoder');
const async = require('async');
const _ = require('lodash');
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

        return async.each(args, (param, callback) => {

            return this.call(contractAddress, param, (err, data) => {

                if (err) {
                    return callback(err);
                }

                result[param.paramName] = data;

                return callback();
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

        return InsightApiRepository.callContract(contractAddress, param.hash, null, (err, data) => {

            try {

                let solidity = this._getSolidityInterfaceEncoder(param.paramName);

                result = solidity.unpackOutput(data.executionResult.output);

                switch (param.type) {
                    case "uint8":
                    case "uint256":
                        result = result.toString(10);

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

    /**
     *
     * @param {String} contractAddress
     * @param {Array} paramHashes
     * @param {String} from
     * @param {Function} next
     * @returns {*}
     */
    callEncodedParams(contractAddress, paramHashes, from, next) {

        let result = [];

        paramHashes = _.uniq(paramHashes);

        return async.each(paramHashes, (paramHash, callback) => {

            return InsightApiRepository.callContract(contractAddress, paramHash, from, (err, data) => {

                if (err) {
                    return callback(err);
                }


                if (!data || !data.executionResult) {
                    result.push({
                        hash: paramHash,
                        output: '',
                        gas_used: 0,
                        excepted: true
                    });
                } else {
                    result.push({
                        hash: paramHash,
                        output: data.executionResult.output,
                        gas_used: data.executionResult.gasUsed,
                        excepted: data.executionResult.excepted
                    });
                }



                return callback(err, data);

            });

        }, (err) => {
            return next(err, result);
        });

    }

}

module.exports = ContractsInfoService;