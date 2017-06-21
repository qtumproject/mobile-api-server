const MobileAddressBalance = require('../Models/MobileAddressBalance');
const async = require('async');
const _ = require('lodash');

class MobileAddressBalanceRepository {

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Function} next
     * @returns {*}
     */
    static fetchByAddresses(addresses, next) {
        return MobileAddressBalance.find({'addresses.address': {$in: addresses}}, (err, tokens) => {
            return next(err, tokens);
        });
    }

    /**
     *
     * @param {String} tokenId
     * @param {Function} next
     * @returns {*}
     */
    static fetchById(tokenId, next) {
        return MobileAddressBalance.findOne({token_id: tokenId}, (err, token) => {
            return next(err, token);
        });
    }

    /**
     *
     * @param {String} tokenId
     * @param {Array.<{address: String, balance: Number}>} addresses
     * @param {Function} next
     * @returns {*}
     */
    static createOrUpdateToken(tokenId, addresses, next) {

        return async.waterfall([(callback) => {
            return MobileAddressBalanceRepository.fetchById(tokenId, (err, token) => {
                return callback(err, token);
            });
        }, (token, callback) => {

            let newAddresses = [];

            if (token) {

                let addressHash = {};

                token.addresses.forEach((addressObject) => {
                    addressHash[addressObject.address] = addressObject
                });

                addresses.forEach((addressObject) => {
                    if (!addressHash[addressObject.address]) {
                        newAddresses.push(addressObject);
                    }
                });

                if (!newAddresses.length) {
                    return callback();
                }

                return MobileAddressBalanceRepository.updateToken(tokenId, newAddresses, (err, key) => {
                    return callback(err, key);
                });

            } else {

                addresses.forEach((addressObject) => {
                    newAddresses.push(addressObject);
                });

                return MobileAddressBalanceRepository.createToken(tokenId, newAddresses, (err, key) => {
                    return callback(err, key);
                });

            }

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

        if (!addresses) {

            return MobileAddressBalance.remove({token_id: tokenId}, (err, token) => {
                return next(err, token);
            });

        }

        return async.waterfall([(callback) => {
            return MobileAddressBalance.findOne({token_id: tokenId}, (err, token) => {
                return callback(err, token)
            });
        }, (token, callback) => {

            if (!token) {
                return callback(null);
            }

            let currentAddresses = token.addresses.map((addressObject) => {
                return addressObject.address;
            });

            let newArray = _.difference(currentAddresses, addresses);

            if (newArray.length) {

                return MobileAddressBalance.update({token_id: tokenId}, {$pull: { addresses: {address: {$in: addresses}} }}, (err, token) => {
                    if (err) {
                        return callback(err, token);
                    }
                });

            } else {

                return MobileAddressBalance.remove({token_id: tokenId}, (err, token) => {
                    return callback(err, token);
                });

            }

        }], (err) => {
            return next(err);
        });

    }

    /**
     *
     * @param {String} tokenId
     * @param {Array.<{address: String, balance: Number}>} addresses
     * @param {Function} next
     * @returns {*}
     */
    static createToken(tokenId, addresses, next) {

        return MobileAddressBalance.create({
            token_id: tokenId,
            addresses: addresses
        }, (err, key) => {
            return next(err, key);
        });

    }

    /**
     *
     * @param {String} tokenId
     * @param {Array.<{address: String, balance: Number}>} addresses
     * @param {Function} next
     * @returns {*}
     */
    static updateToken(tokenId, addresses, next) {

        return MobileAddressBalance.update(
            {token_id: tokenId},
            {$push: {addresses: {$each: addresses}}},
            (err, key) => {
                return next(err, key);
            }
        );

    }

}

module.exports = MobileAddressBalanceRepository;