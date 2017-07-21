const _ = require('lodash');
const async = require('async');
const coreLib = require('qtumcore-lib');
const ContractPurchaseRepository = require('../Repositories/ContractPurchaseRepository');
const ContractsRepository = require('../Repositories/ContractsRepository');
const ContractDownloadRepository = require('../Repositories/ContractDownloadRepository');
const ContractPurchase = require('../Models/ContractPurchase');
const Address = require('../Components/Address');
const CONFIG = require('../../config/main.json');
const MessageCryptographer = require('../Components/MessageCryptographer');


class ContractCodeGetterService {

    /**
     *
     * @param {String} accessToken
     * @param {String} requestId
     * @param {String} type - 'source', 'byte'
     * @param {Function} next
     * @return {*}
     */
    static getCodeByAccessToken(accessToken, requestId, type, next) {

        return ContractPurchaseRepository.fetchByAccessTokenAndRequestId(accessToken, requestId, (err, result) => {

            if (err) {
                return next(err);
            }

            if (!result) {
                return next('Not Found', 404);
            }

            if (result.status !== ContractPurchase.STATUSES.FINISHED) {

                switch (type) {
                    case 'source':
                        return next(null, {
                            source_code: ''
                        });
                        break;
                    case 'byte':
                        return next(null, {
                            bytecode: ''
                        });
                        break;
                }

            }

            return ContractCodeGetterService._getCode(result.contract_id, result.request_id, type, (err, contract) => {
                return next(err, contract);
            });

        });

    }

    /**
     *
     * @param {String} contractId
     * @param {String} type - 'source', 'byte'
     * @param {String} requestId
     * @param {Function} next
     * @return {*}
     * @private
     */
    static _getCode(contractId, requestId, type, next) {
        return async.waterfall([(callback) => {
            return ContractDownloadRepository.createDownload(contractId, requestId, (err) => {
                return callback(err);
            });
        }, (callback) => {
            return ContractsRepository.incrementCountDownloads(contractId, (err) => {
                return callback(err);
            });
        }, (callback) => {
            return ContractsRepository.fetchContract(contractId, (err, contract) => {

                if (err) {
                    return callback(err);
                }

                if (!contract) {
                    return callback('Not Found', 404);
                }

                switch (type) {
                    case 'source':
                        return callback(null, {
                            source_code: contract.source_code ? contract.source_code : ''
                        });
                        break;
                    case 'byte':
                        return callback(null, {
                            bytecode: contract.bytecode ? contract.bytecode : ''
                        });
                        break;
                }

            });
        }], (err, result) => {
            return next(err, result);
        });

    }

    /**
     *
     * @param {Array} buyerAddresses
     * @param {Array.<String>} signs
     * @param {Number} nonce
     * @param {String} type - 'source', 'byte'
     * @param {Function} next
     * @return {*}
     */
    static getCodeBySigns(buyerAddresses, signs, nonce, type, next) {

        if (!buyerAddresses.length) {
            return next('Addresses field is empty.');
        }

        if (!signs.length) {
            return next('Signs field is empty.');
        }

        if (buyerAddresses.length !== signs.length) {
            return next('Invalid length');
        }

        nonce = parseInt(nonce);

        if (!_.isInteger(nonce)) {
            return next('Invalid nonce');
        }

        let invalidAddress = buyerAddresses.find((address) => {
            return !Address.isValid(address, CONFIG.NETWORK);
        });

        if (invalidAddress) {
            return next('Invalid address.');
        }

        let isValidSigns = true;

        try {

            let buyerAddressesString = buyerAddresses.join('');

            if (buyerAddresses.find((address, idx) => {
                    let msgSigner = new MessageCryptographer(buyerAddressesString + nonce);
                    return !msgSigner.verify(address, signs[idx]);
                })) {
                isValidSigns = false;
            }

        } catch (e) {
            isValidSigns = false;
        }

        if (!isValidSigns) {
            return next('Invalid signs');
        }

        return ContractPurchaseRepository.fetchExactlyByAddresses(buyerAddresses, (err, result) => {

            if (err) {
                return next('fetch by addresses Error');
            }

            if (!result || !result.contract_id) {
                return next('Not found', 404);
            }

            if (result.nonce >= nonce) {
                return next('Invalid signs', 400);
            }

            return async.waterfall([(callback) => {
                return ContractPurchaseRepository.updateNonceById(result._id, nonce, (err) => {
                    return callback(err);
                });
            }, (callback) => {
                return ContractCodeGetterService._getCode(result.contract_id, result.request_id, type, (err, contract) => {
                    return callback(err, contract);
                });
            }], (err, contract) => {
                return next(err, contract);
            });

        });

    }

}

module.exports = ContractCodeGetterService;