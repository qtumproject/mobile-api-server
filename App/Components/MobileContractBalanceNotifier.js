const async = require('async');
const gcm = require('node-gcm');
const logger = require('log4js').getLogger('MobileContractBalanceNotifier');
const MobileTokenBalanceRepository = require('../Repositories/MobileTokenBalanceRepository');
const MobileTokenBalance = require('../Models/MobileTokenBalance');
const config = require('../../config/main.json');
const BALANCE_CHECKER_TIMER_MS = 60000;

class MobileContractBalanceNotifier {

    constructor(contractBalanceComponent) {

        logger.info('Init');

        this.notifier = new gcm.Sender(config.FIREBASE_SERVER_TOKEN);
        this.contractBalanceComponent = contractBalanceComponent;

        this.checkBalances();

    }

    /**
     *
     * @param {String} tokenId
     * @param {String} prevTokenId
     * @param {String} contractAddress
     * @param {Array.<String>} addresses
     * @returns {*}
     */
    subscribeMobileTokenBalance(tokenId, prevTokenId, contractAddress, addresses) {

        return async.waterfall([(callback) => {

            if (prevTokenId) {
                return MobileTokenBalanceRepository.deleteToken(prevTokenId, null, null, (err) => {
                    return callback(err);
                });
            }

            return callback();

        }, (callback) => {

            return MobileTokenBalanceRepository.fetchByTokenAndContract(tokenId, contractAddress, (err, token) => {
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

    /**
     *
     * @param {String} tokenId
     * @param {String} contractAddress
     * @param {Array.<String>|null} addresses
     * @param {Function} next
     * @returns {*}
     */
    unsubscribeMobileTokenBalance(tokenId, contractAddress, addresses, next) {
        return MobileTokenBalanceRepository.deleteToken(tokenId, contractAddress, addresses, (err, key) => {
            return next(err, key);
        })
    }

    /**
     *
     * @param {String} contractAddress
     * @param {Array.<{address: String, balance: Number}>} balances
     * @returns {*}
     */
    getMessage(contractAddress, balances) {

        let message = new gcm.Message();

        message.addNotification('title', 'QTUM');
        message.addNotification('body', 'Balance Token changed!');
        message.addNotification('sound', true);
        message.addNotification('icon', 'icon');
        message.addNotification('color', '#2e9ad0');

        message.addData('contract_address', contractAddress);
        message.addData('balances', balances);

        return message;

    }

    /**
     *
     * @param {String} tokenId
     * @param {String} contractAddress
     * @param {Array.<{address: String, balance: Number}>} balances
     * @param {Function} next
     */
    notifyToken(tokenId, contractAddress, balances, next) {

        let message = this.getMessage(contractAddress, balances);

        return this.notifier.send(message, { registrationTokens: [tokenId]}, (err, response) => {

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

    /**
     *
     * @param {Object} diffBalances
     * @param {Object.<String>} diffBalances.token
     * @param {Object.<String>} diffBalances.token.contract
     * @param {String} diffBalances.token.contract.address
     * @param {Function} next
     * @returns {*}
     */
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

                                return MobileTokenBalanceRepository.updateTokenAddressBalance(tokenId, addressObject.id, currentBalance, (err) => {

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

                if (err) {
                    logger.error(err);
                }

                return this.notifyTokens(diffBalances, () => {
                    setTimeout(() => {
                        this.checkBalances();
                    }, BALANCE_CHECKER_TIMER_MS)
                });

            }
        );
    }

}

module.exports = MobileContractBalanceNotifier;