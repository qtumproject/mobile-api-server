const logger = require('log4js').getLogger('ContractsStoreController');
const _ = require('lodash');
const ContractsRepository = require('../Repositories/ContractsRepository');
const ContractPurchaseRepository = require('../Repositories/ContractPurchaseRepository');
const ContractBuyerService = require('../Services/ContractBuyerService');
const ContractCodeGetterService = require('../Services/ContractCodeGetterService');
const mongoose = require('mongoose');

let Controllers = getControllers();

class ContractsStoreController {

    constructor() {
        logger.info('Init');
    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {Object} data.req.params
     * @param {String} data.req.params.contractId
     * @return {*}
     */
    fetchContract(cb, data) {

        let req = data.req,
            contractId = req.params.contractId;

        if (!this._isValidObjectId(contractId)) {
            return cb('Invalid contract id', 422);
        }

        return ContractsRepository.fetchPublicContract(contractId, (err, contract) => {
            return cb(err, contract);
        });

    }

    /**
     *
     * @param {Function} cb
     * @return {*}
     */
    fetchTrendingNow(cb) {
        return ContractsRepository.fetchTrendingNow((err, contracts) => {
            return cb(err, contracts);
        });
    }

    /**
     *
     * @param {Function} cb
     * @return {*}
     */
    fetchLastAdded(cb) {

        return ContractsRepository.fetchLastAdded((err, contract) => {
            return cb(err, contract);
        });

    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {Object} data.req.params
     * @param {Number} data.req.params.limit
     * @param {Number} data.req.params.offset
     * @param {String} data.req.query.type
     * @param {String} data.req.query.name
     * @param {Array} data.req.query.tags
     * @return {*}
     */
    fetchContracts(cb, data) {

        let req = data.req,
            options = this._formatOptions(req.params.limit, req.params.offset, req.query.type, req.query.name, req.query.tags);

        return ContractsRepository.fetchContracts(options, (err, contract) => {
            return cb(err, contract);
        });

    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {String} data.req.params.contractId
     * @return {*}
     */
    fetchAbi(cb, data) {

        let req = data.req,
            contractId = req.params.contractId;

        if (!this._isValidObjectId(contractId)) {
            return cb('Invalid contract id', 400);
        }

        return ContractsRepository.fetchAbi(contractId, (err, contract) => {
            return cb(err, contract);
        });

    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {String} data.req.params.contractId
     * @return {*}
     */
    buyContract(cb, data) {

        let req = data.req,
            contractId = req.params.contractId;

        if (!this._isValidObjectId(contractId)) {
            return cb('Invalid contract id', 422);
        }

        return ContractBuyerService.buyContract(contractId, (err, result) => {

            if (err) {
                return cb(err);
            }

            return cb(err, {
                address: result.address,
                amount: result.amount,
                request_id: result.request_id,
                access_token: result.access_token
            });

        });

    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {String} data.req.query.request_id
     * @return {*}
     */
    getPaidInfoByRequestId(cb, data) {

        let requestId = data.req.query.request_id,
            contractId = data.req.params.contractId;

        if (!requestId) {
            return cb("Bad Request", 400);
        }

        if (!this._isValidObjectId(contractId)) {
            return cb('Invalid contract id', 422);
        }

        if (!this._isValidObjectId(requestId)) {
            return cb('Invalid request id', 422);
        }

        return ContractPurchaseRepository.getPaidInfoByRequestId(contractId, requestId, (err, result) => {
            return cb(err, result);
        });

    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {Array} data.req.query.addresses
     * @return {*}
     */
    getPaidInfoByAddresses(cb, data) {

        let addresses = data.req.query.addresses,
            contractId = data.req.params.contractId;

        if (!this._isValidObjectId(contractId)) {
            return cb('Invalid contract id', 422);
        }

        if (!addresses || !_.isArray(addresses) || !addresses.length) {
            return cb("Bad Request", 400);
        }

        return ContractPurchaseRepository.getPaidInfoByAddresses(contractId, addresses, (err, result) => {
            return cb(err, result);
        });

    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     */
    getSourceCode(cb, data) {
        this._getCode(cb, data, 'source');
    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     */
    getBytecode(cb, data) {
        this._getCode(cb, data, 'byte');
    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {String} type - source, byte
     * @return {*}
     * @private
     */
    _getCode(cb, data, type) {

        let requestId = data.req.body.request_id,
            contractId = data.req.params.contractId,
            accessToken = data.req.body.access_token,
            signs = data.req.body.signs,
            nonce = data.req.body.nonce,
            buyerAddresses = data.req.body.buyer_addresses;

        if (!this._isValidObjectId(contractId)) {
            return cb('Bad request', 400);
        }

        if (requestId && this._isValidObjectId(requestId) && accessToken && _.isString(accessToken) && accessToken.trim()) {

            return ContractCodeGetterService.getCodeByAccessToken(accessToken, requestId, type, (err, result) => {
                return cb(err, result);
            });

        }

        if (signs && _.isArray(signs) && signs.length && nonce && _.isString(nonce) && nonce.trim() && buyerAddresses && _.isArray(buyerAddresses) && buyerAddresses.length) {

            return ContractCodeGetterService.getCodeBySigns(buyerAddresses, signs, nonce, type, (err, result) => {
                return cb(err, result);
            });

        }

        return cb('Bad request', 400);
    }

    /**
     *
     * @param {String} contractId
     * @private
     */
    _isValidObjectId(contractId) {
        return mongoose.Types.ObjectId.isValid(contractId);
    }

    /**
     *
     * @param limit
     * @param offset
     * @param type
     * @param tags
     * @return {{offset: Number, limit: Number, tags: Array, type: *, name: *}}
     * @private
     */
    _formatOptions(limit, offset, type, name, tags) {

        const MAX_LIMIT = 20;

        limit = parseInt(limit, 10);
        offset = parseInt(offset, 10);

        if (isNaN(limit)) {
            limit = MAX_LIMIT;
        }

        if (isNaN(offset)) {
            offset = 0
        }

        limit = Math.abs(limit);
        offset = Math.abs(offset);

        if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }

        if (tags && !_.isArray(tags)) {
            tags = [];
        }

        return {
            offset: offset,
            limit: limit,
            tags: tags,
            type: type && _.isString(type) ? type : null,
            name: name && _.isString(name) ? name : null
        };

    }

}

Controllers.contractsStore = new ContractsStoreController();