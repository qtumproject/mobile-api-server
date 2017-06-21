const MobileTokenBalance = require('../Models/MobileTokenBalance');
const async = require('async');
const _ = require('lodash');

class MobileTokenBalanceRepository {

    static createOrUpdateToken(tokenId, contractAddress, addresses, next) {

        return async.waterfall([(callback) => {
            return MobileTokenBalance.findOne({token_id: tokenId, contract_address: contractAddress}, (err, token) => {
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

                return MobileTokenBalanceRepository.updateToken(tokenId, contractAddress, newAddresses, (err, key) => {
                    return callback(err, key);
                });

            } else {

                addresses.forEach((addressObject) => {
                    newAddresses.push(addressObject);
                });

                return MobileTokenBalanceRepository.createToken(tokenId, contractAddress, newAddresses, (err, key) => {
                    return callback(err, key);
                });

            }

        }], (err) => {
            return next(err);
        });

    }

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

    static createToken(tokenId, contractAddress, addresses, next) {

        return MobileTokenBalance.create({
            token_id: tokenId,
            contract_address: contractAddress,
            addresses: addresses
        }, (err, key) => {
            return next(err, key);
        });

    }

    static updateToken(tokenId, contractAddress, addresses, next) {

        return MobileTokenBalance.update(
            {token_id: tokenId, contract_address: contractAddress},
            {$push: {addresses: {$each: addresses}}},
            (err, key) => {
                return next(err, key);
            }
        );

    }

}

module.exports = MobileTokenBalanceRepository;