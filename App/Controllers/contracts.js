const ContractsGenerator = require("../Services/ContractsGenerator");
const logger = require('log4js').getLogger('Contracts Controller');
const _ = require('lodash');
const TokenInterface = require('../Components/ContractData/TokenInterface');
const ContractsInfoService = require('../Services/ContractsInfoService');
const ContractsTypesService = require('../Services/ContractsTypesService');
const CacheRepository = require('../Repositories/CacheRepository');
const InsightApiRepository = require('../Repositories/InsightApiRepository');

let Controllers = getControllers();

class ContractsController {

    constructor() {
        logger.info('Init');
        this.solidities = {};
        this.fetchEncodedParams = this.fetchEncodedParams.bind(this);
        this.fetchContractParams = this.fetchContractParams.bind(this);
        this.encodeContract = this.encodeContract.bind(this);
        this.contractsInfoService = new ContractsInfoService(TokenInterface.interface, TokenInterface.functionHashes);
        this.contractsTypesService = new ContractsTypesService(new CacheRepository());

    }

    encodeContract(cb, data) {

        let req = data.req,
            contract = req.body.contract;

        if (!req.body.contract) {
            return cb("Bad request", 400);
        }

        try {
            return cb(null, ContractsGenerator.encodeContract(contract));
        } catch (e) {
            return cb(e.message, 400);
        }

    }

    fetchEncodedParams(cb, data) {

        let req = data.req,
            contractAddress = req.params.contractAddress,
            from = req.body.from,
            hashes = req.body.hashes;

        if (!_.isArray(hashes) || !_.isString(contractAddress) || !contractAddress.trim()) {
            return cb("Bad Request", 400);
        }

        hashes = hashes.filter((hash) => {
            return !!(hash && hash.trim());
        });

        if(!hashes.length) {
            return cb("Bad Request", 400);
        }

        return this.contractsInfoService.callEncodedParams(contractAddress, hashes, from, (err, data) => {

            if (err) {
                return cb("Not Found", 404);
            }

            return cb(null, {
                items: data
            });

        });

    }

    generateTokenBytecode(cb, data) {

        try {

            let tokens = ContractsGenerator.generateToken({
                initialSupply: data._post.initialSupply,
                tokenName: data._post.tokenName,
                decimalUnits: data._post.decimalUnits,
                tokenSymbol: data._post.tokenSymbol
            });

            return cb(null, tokens);

        } catch (e) {
            return cb(e.message, null);
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

    fetchContractTypes(cb) {
        this.contractsTypesService.getTypes((err, result) => {
            return cb(err, result);
        })
    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {Object} data.req.params
     * @param {String} data.req.params.contractAddress
     * @return {*}
     */
    exists(cb, data) {

        let req = data.req,
            contractAddress = req.params.contractAddress;

        if (!contractAddress || !_.isString(contractAddress) || !contractAddress.trim()) {
            return cb("Bad Request", 400);
        }

        return InsightApiRepository.getAccountInfo(contractAddress, (err, res) => {

            if (err || !res) {
                logger.error('Bad contract address', contractAddress, err, res);
                return cb(null, {exists: false});
            }

            return cb(null, {exists: true});

        });

    }
}

Controllers.contracts = new ContractsController();