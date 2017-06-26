const MobileAddressBalance = require('../Models/MobileAddressBalance');
const async = require('async');
const _ = require('lodash');

class MobileAddressBalanceRepository {

    /**
     *
     * @param {String} address
     * @param {Function} next
     * @returns {*}
     */
    static fetchByAddress(address, next) {
        return MobileAddressBalance.findOne({address: address}, (err, address) => {
            return next(err, address);
        });
    }

    /**
     *
     * @param {String} address
     * @param {String} tokenId
     * @param {String} language
     * @param {Function} next
     * @returns {*}
     */
    static addTokenToAddress(address, tokenId, language, next) {

        return MobileAddressBalance.update(
            {address: address},
            {$push: {tokens: {
                token: tokenId,
                language: language
            }}},
            (err, key) => {
                return next(err, key);
            }
        );

    }

    /**
     *
     * @param {String} address
     * @param {String} tokenId
     * @param {String} language
     * @param {Function} next
     * @returns {*}
     */
    static createAddressWithToken(address, tokenId, language, next) {

        return MobileAddressBalance.create({
            address: address,
            tokens: [{
                token: tokenId,
                language: language
            }]
        }, (err, key) => {
            return next(err, key);
        });

    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Function} next
     * @returns {*}
     */
    static fetchByAddresses(addresses, next) {
        return MobileAddressBalance.find({address: addresses}, (err, tokens) => {
            return next(err, tokens);
        });
    }

    /**
     *
     * @param {String} tokenId
     * @param {Array.<String>|null} addresses
     * @param {Function} next
     * @returns {*}
     */
    static fetchAddresses(tokenId, addresses, next) {

        if (addresses) {
            return MobileAddressBalance.find({'tokens.token': {$in: [tokenId]}, address: {$in: addresses}}, (err, addressObjects) => {
                return next(err, addressObjects);
            });
        }

        return MobileAddressBalance.find({'tokens.token': {$in: [tokenId]}}, (err, addressObjects) => {
            return next(err, addressObjects);
        });
    }

    /**
     *
     * @param {String} tokenId
     * @param {Array.<String>} addresses
     * @param {String} language
     * @param {Function} next
     * @returns {*}
     */
    static createOrUpdateAddresses(tokenId, addresses, language, next) {

        return async.waterfall([(callback) => {
            return MobileAddressBalanceRepository.fetchAddresses(tokenId, null, (err, savedAddresses) => {
                return callback(err, savedAddresses);
            });
        }, (savedAddresses, callback) => {

            let newAddresses = [];

            if (savedAddresses.length) {

                let addressHash = {};

                savedAddresses.forEach((addressObject) => {
                    addressHash[addressObject.address] = addressObject
                });

                addresses.forEach((address) => {
                    if (!addressHash[address]) {
                        newAddresses.push(address);
                    }
                });

            } else {
                newAddresses = addresses;
            }

            if (!newAddresses.length) {
                return callback();
            }

            return async.each(newAddresses, (address, callback) => {

                return async.waterfall([(callback) => {
                    return MobileAddressBalanceRepository.fetchByAddress(address, (err, addressObject) => {
                        return callback(err, addressObject);
                    });
                }, (addressObject, callback) => {

                    if (addressObject) {
                        return MobileAddressBalanceRepository.addTokenToAddress(address, tokenId, language, (err) => {
                            return callback(err);
                        });
                    }

                    return MobileAddressBalanceRepository.createAddressWithToken(address, tokenId, language, (err) => {
                        return callback(err);
                    });

                }], (err) => {
                    return callback(err);
                });

            });

        }], (err) => {
            return next(err);
        });

    }

    /**
     *
     * @param {String} tokenId
     * @param {Array.<String>|null} addresses
     * @param {Function} next
     * @returns {*}
     */
    static deleteToken(tokenId, addresses, next) {

        return async.waterfall([(callback) => {
            return MobileAddressBalanceRepository.fetchAddresses(tokenId, addresses, (err, addresses) => {
                return callback(err, addresses);
            });
        }, (addresses, callback) => {

            if (!addresses.length) {
                return callback(null);
            }

            return async.each(addresses, (addressObject, callback) => {

                let tokens = _.uniqBy(addressObject.tokens, 'token');

                if (tokens.length === 1) {
                    return MobileAddressBalance.remove({address: addressObject.address}, (err, token) => {
                        return callback(err, token);
                    });
                } else {
                    return MobileAddressBalance.update({address: addressObject.address}, {$pull: {tokens: {token: {$in: [tokenId]}}}}, (err) => {
                        if (err) {
                            return callback(err);
                        }
                    });
                }

            }, (err) => {
                return callback(err);
            });

        }], (err) => {
            return next(err);
        });

    }

}

module.exports = MobileAddressBalanceRepository;