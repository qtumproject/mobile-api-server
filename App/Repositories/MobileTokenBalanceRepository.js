const MobileTokenBalance = require('../Models/MobileTokenBalance');
const async = require('async');
const _ = require('lodash');

class MobileTokenBalanceRepository {

    /**
     *
     * @param {String} tokenId
     * @param {String} contractAddress
     * @param {Function} next
     * @returns {*}
     */
    static fetchByTokenAndContract(tokenId, contractAddress, next) {
        return MobileTokenBalance.findOne({token_id: tokenId, contract_address: contractAddress}, (err, token) => {
            return next(err, token);
        });
    }

    /**
     *
     * @param {String} tokenId
     * @param {String} addressId
     * @param {String} balance
     * @param {Function} next
     * @returns {*}
     */
    static updateTokenAddressBalance(tokenId, addressId, balance, next) {
        return MobileTokenBalance.update({ token_id: tokenId, 'addresses._id': addressId }, { $set: { 'addresses.$.balance': balance }}, (err) => {
            return next(err);
        });
    }

    /**
     *
     * @param {String} tokenId
     * @param {String} contractAddress
     * @param {Array.<{address: String, balance: Number}>} addresses
     * @param {String} language
     * @param {Function} next
     * @returns {*}
     */
    static createOrUpdateToken(tokenId, contractAddress, addresses, language, next) {

        return async.waterfall([(callback) => {
            return MobileTokenBalanceRepository.fetchByTokenAndContract(tokenId, contractAddress, (err, token) => {
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

                return MobileTokenBalanceRepository.updateTokenAddresses(tokenId, contractAddress, newAddresses, language, (err, key) => {
                    return callback(err, key);
                });

            } else {

                addresses.forEach((addressObject) => {
                    newAddresses.push(addressObject);
                });

                return MobileTokenBalanceRepository.createToken(tokenId, contractAddress, newAddresses, language, (err, key) => {
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
     * @param {String|null} contractAddress
     * @param {Array.<String>|null} addresses
     * @param {Function} next
     * @returns {*}
     */
    static deleteToken(tokenId, contractAddress, addresses, next) {

        if (!contractAddress) {

            return MobileTokenBalance.remove({token_id: tokenId}, (err, token) => {
                return next(err, token);
            });

        }

        if (!addresses) {

            return MobileTokenBalance.remove({token_id: tokenId, contract_address: contractAddress}, (err, token) => {
                return next(err, token);
            });

        }

        return async.waterfall([(callback) => {
            return MobileTokenBalance.findOne({token_id: tokenId, contract_address: contractAddress}, (err, token) => {
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

                return MobileTokenBalance.update({token_id: tokenId, contract_address: contractAddress}, {$pull: { addresses: {address: {$in: addresses}} }}, (err, token) => {
                    if (err) {
                        return callback(err, token);
                    }
                });

            } else {

                return MobileTokenBalance.remove({token_id: tokenId, contract_address: contractAddress}, (err, token) => {
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
     * @param {String} contractAddress
     * @param {Array.<{address: String, balance: Number}>} addresses
     * @param {String} language
     * @param {Function} next
     * @returns {*}
     */
    static createToken(tokenId, contractAddress, addresses, language, next) {

        return MobileTokenBalance.create({
            token_id: tokenId,
            contract_address: contractAddress,
            addresses: addresses,
            language: language
        }, (err, key) => {
            return next(err, key);
        });

    }

    /**
     *
     * @param {String} tokenId
     * @param {String} contractAddress
     * @param {Array.<{address: String, balance: Number}>} addresses
     * @param {String} language
     * @param {Function} next
     * @returns {*}
     */
    static updateTokenAddresses(tokenId, contractAddress, addresses, language, next) {
        return MobileTokenBalance.update(
            {token_id: tokenId, contract_address: contractAddress},
            {$push: {addresses: {$each: addresses}}, language: language},
            (err, key) => {
                return next(err, key);
            }
        );

    }

}

module.exports = MobileTokenBalanceRepository;