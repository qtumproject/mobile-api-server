const ContractsGenerator = require("../Services/ContractsGenerator");
const logger = require('log4js').getLogger('Contracts Controller');
const SolidityEncoder = require('../Components/Solidity/SolidityEncoder');
const TokenInterface = require('../Components/ContractData/TokenInterface');
const ContractsInfoService = require('../Services/ContractsInfoService');
const _ = require('lodash');

let Controllers = getControllers();

class ContractsController {

    constructor() {
        logger.info('Init');
        this.solidities = {};
        this.fetchContractParams = this.fetchContractParams.bind(this);
        this.contractsInfoService = new ContractsInfoService(TokenInterface.interface, TokenInterface.functionHashes);
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
            paramsWhiteHash = {
                symbol:'symbol',
                decimals: 'decimals',
                totalSupply: 'totalSupply',
                name: 'name'
            };

        if (req.query.keys && _.isString(req.query.keys)) {

            let fields = req.query.keys.split(',');

            if (fields && fields.length) {

                fields.forEach((field) => {

                    if (paramsWhiteHash.hasOwnProperty(field)) {
                        paramNames.push(field);
                    }

                });

            }

        }

        if (!paramNames.length) {
            paramNames = Object.keys(paramsWhiteHash);
        }

        this.contractsInfoService.fetchInfoByParams(req.params.contractAddress, paramNames, (err, result) => {
            return cb(err, result);
        });

    }

}

Controllers.contracts = new ContractsController();