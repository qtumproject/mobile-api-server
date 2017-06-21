const _ = require('lodash');
const async = require('async');
const gcm = require('node-gcm');
const logger = require('log4js').getLogger('MobileTokenBalanceNotifier');
const MobileTokenBalanceRepository = require('../Repositories/MobileTokenBalanceRepository');
const MobileTokenBalance = require('../Models/MobileTokenBalance');
const config = require('../../config/main.json');
const BALANCE_CHECKER_TIMER_MS = 60000;

class MobileTokenBalanceNotifier {

    constructor(contractBalanceComponent) {
        logger.info('Init');

        this.sender = new gcm.Sender(config.FIREBASE_SERVER_TOKEN);

        this.contractBalanceComponent = contractBalanceComponent;
        this.checkBalances();
    }

    subscribeMobileTokenBalance(tokenId, contractAddress, addresses) {

        return async.waterfall([(callback) => {
            return MobileTokenBalance.findOne({token_id: tokenId, contract_address: contractAddress}, (err, token) => {
                return callback(err, token);
            });
        }, (token, callback) => {

            let newAddresses = [];
            let newAddressesObjects = [];

            if (token) {

                let addressHash = {};

                token.addresses.forEach((addressObject) => {
                    addressHash[addressObject.address] = addressObject
                });

                addresses.forEach((address) => {
                    if (!addressHash[address]) {
                        newAddresses.push(address);
                    }
                });

            } else {

                addresses.forEach((address) => {
                    newAddresses.push(address);
                });

            }

            if (!newAddresses.length) {
                return callback();
            }

            return async.eachSeries(newAddresses, (address, callback) => {

                return this.contractBalanceComponent.getBalance(contractAddress, address, (err, data) => {

                    let balance;

                    if (err || !data) {
                        balance = {
                            address: address,
                            balance: 0
                        };
                    } else {
                        balance = {
                            address: address,
                            balance: data.balanceOf
                        };
                    }

                    newAddressesObjects.push(balance);

                    return callback(err);

                });
            }, (err) => {

                if (err) {
                    return callback(err);
                }

                return MobileTokenBalanceRepository.createOrUpdateToken(tokenId,
                    contractAddress,
                    newAddressesObjects,
                    (err) => {
                        if (err) {
                            logger.error('Subscribe Mobile Error:', 'token_balance_change', err);
                            return err;
                        }

                        logger.info('Subscribe Mobile:', 'token_balance_change', tokenId, contractAddress);

                    }
                );

            });

        }], (err) => {

        });

    }

    unsubscribeMobileTokenBalance(tokenId, contractAddress, addresses, next) {
        return MobileTokenBalanceRepository.deleteToken(tokenId, contractAddress, addresses, (err, key) => {
            return next(err, key);
        })
    }

    notifyToken(tokenId, contractAddress, balances, next) {

        let message = new gcm.Message();

        message.addNotification('title', 'QTUM');
        message.addNotification('body', 'Balance Token changed!');
        message.addNotification('sound', true);
        message.addNotification('icon', 'icon');
        message.addNotification('color', '#a57eec');

        message.addData('contract_address', contractAddress);
        message.addData('balances', balances);

        return this.sender.send(message, { registrationTokens: [tokenId] }, (err, response) => {

            if (err) {
                return next(err);
            }

            logger.info(err, response);

            if (response.failure) {

                logger.info('Failure. Delete token..', tokenId);

                return MobileTokenBalanceRepository.deleteToken(tokenId, null, null, (err) => {
                    return next(err);
                });

            }

            return next();

        });

    }

    notifyTokens(diffBalances, next) {

        let tokens = Object.keys(diffBalances);

        if (tokens.length) {

            return async.eachSeries(tokens, (token, callback) => {

                let contracts = Object.keys(diffBalances[token]);

                return async.eachSeries(contracts, (contract, callback) => {
                    let balances = [];

                    for(let address in diffBalances[token][contract]) {
                        if (diffBalances[token][contract].hasOwnProperty(address)) {
                            balances.push({
                                address: address,
                                balance: diffBalances[token][contract][address]
                            });
                        }
                    }

                    return this.notifyToken(token, contract, balances, () => {
                        return callback();
                    });

                }, () => {
                    return callback();
                });

            }, (err) => {
                return next(err);
            });

        } else {

            console.log('not notify');

            return next();
        }

    }

    checkBalances() {

        let cursor = MobileTokenBalance.find().cursor(),
            document = null,
            diffBalances = {};

        return async.during(
            (callback) => {
                return cursor.next(function(error, doc) {
                    document = doc;
                    return callback(null, document);
                });
            },
            (callback) => {

                let tokenId = document.token_id,
                    contractAddress = document.contract_address;

                return async.eachSeries(document.addresses, (addressObject, callback) => {

                    let address = addressObject.address,
                        previousBalance = addressObject.balance;

                    return this.contractBalanceComponent.getBalance(contractAddress, address, (err, data) => {

                        if (err || !data) {
                            return callback(err);
                        } else {

                            let currentBalance = data.balanceOf;

                            if (previousBalance !== currentBalance) {
                                return MobileTokenBalance.update({ token_id: tokenId, 'addresses._id': addressObject.id }, { $set: { 'addresses.$.balance': currentBalance }}, (err) => {

                                    if (err) {
                                        return callback(err);
                                    }

                                    if (!diffBalances[tokenId]) {
                                        diffBalances[tokenId] = {};
                                    }

                                    if (!diffBalances[tokenId][contractAddress]) {
                                        diffBalances[tokenId][contractAddress] = {};
                                    }

                                    diffBalances[tokenId][contractAddress][address] = currentBalance;

                                    return callback();

                                });
                            } else {
                                return callback();
                            }

                        }

                    });

                }, () => {
                    return callback();
                });

            },
            (err) => {

                return this.notifyTokens(diffBalances, () => {
                    console.log('end!');
                    setTimeout(() => {
                        this.checkBalances();
                    }, BALANCE_CHECKER_TIMER_MS)
                });

            }
        );
    }



}

module.exports = MobileTokenBalanceNotifier;