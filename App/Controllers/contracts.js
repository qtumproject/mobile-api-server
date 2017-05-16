const ContractsGenerator = require("../Services/ContractsGenerator");
const logger = require('log4js').getLogger('Contracts Controller');
const _ = require('lodash');
const TokenInterface = require('../Components/ContractData/TokenInterface');
const ContractsInfoService = require('../Services/ContractsInfoService');

let Controllers = getControllers();

class ContractsController {

    constructor() {
        logger.info('Init');
        this.solidities = {};
        this.fetchContractParams = this.fetchContractParams.bind(this);
        this.encodeContract = this.encodeContract.bind(this);
        this.contractsInfoService = new ContractsInfoService(TokenInterface.interface, TokenInterface.functionHashes);
    }

    encodeContract(cb, data) {

        let req = data.req,
            contract = req.body.contract;

        if (!req.body.contract) {
            return cb("Bad request", 400);
        }

        try {

            let returnData = {},
                encodeData = ContractsGenerator.encodeContract(contract),
                contractsNames = Object.keys(encodeData.contracts);

            contractsNames.forEach((contractName) => {

                returnData[contractName] = {
                    bytecode: encodeData.contracts[contractName]['bytecode'],
                    interface: JSON.parse(encodeData.contracts[contractName]['interface'])
                };

            });

            return cb(null, returnData);

        } catch (e) {
            return cb(e.message, 400);
        }

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
            paramNames = [],
            contractAddress = req.params.contractAddress,
            paramsWhiteList = ['symbol', 'decimals', 'totalSupply', 'name'];

        if (req.query.keys && _.isString(req.query.keys)) {

            let fields = req.query.keys.split(',');

            if (fields && fields.length) {

                fields.forEach((field) => {

                    if (paramsWhiteList.indexOf(field) !== -1) {
                        paramNames.push(field);
                    }

                });

            }

        }

        if (!paramNames.length) {
            paramNames = paramsWhiteList;
        }

        let solidityParams = paramNames.map((paramName) => {
            return this.contractsInfoService.createParam(paramName)
        });

        this.contractsInfoService.fetchInfoBySolidityParams(contractAddress, solidityParams, (err, result) => {
            return cb(err, result);
        });

    }

}

Controllers.contracts = new ContractsController();