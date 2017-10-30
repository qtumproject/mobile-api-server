const async = require('async');
const gcm = require('node-gcm');
const logger = require('log4js').getLogger('MobileContractBalanceNotifier');
const MobileTokenBalanceRepository = require('../Repositories/MobileTokenBalanceRepository');
const MobileTokenBalance = require('../Models/MobileTokenBalance');
const BigNumber = require('bignumber.js');
const config = require('../../config/main.json');
const BALANCE_CHECKER_TIMER_MS = 60000;
const i18n = require("i18n");

class MobileContractBalanceNotifier {

    constructor(tokenContract) {

        logger.info('Init');

        this.notifier = new gcm.Sender(config.FIREBASE_SERVER_TOKEN);
        this.tokenContract = tokenContract;

        this.checkBalances();

    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {String} contractAddress
     * @param {Object} options
     * @param {String|null} options.notificationToken
     * @param {String|null} options.prevToken
     * @param {String|null} options.language
     * @returns {*}
     */
    subscribeMobileTokenBalance(contractAddress, addresses, options) {

        let notificationToken = options.notificationToken,
            prevTokenId = options.prevToken,
            language = options.language;

        return async.waterfall([(callback) => {

            if (prevTokenId) {
                return MobileTokenBalanceRepository.deleteToken(prevTokenId, null, null, (err) => {
                    return callback(err);
                });
            }

            return callback();

        }, (callback) => {

            return MobileTokenBalanceRepository.fetchByTokenAndContract(notificationToken, contractAddress, (err, token) => {
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

                return this.tokenContract.getBalance(contractAddress, address, (err, data) => {

                    let balance;

                    if (err || !data) {
                        balance = {
                            address: address,
                            balance: '0'
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

                return MobileTokenBalanceRepository.createOrUpdateToken(notificationToken,
                    contractAddress,
                    newAddressesObjects,
                    language,
                    (err) => {
                        if (err) {
                            logger.error('Subscribe Mobile Error:', 'token_balance_change', err);
                            return err;
                        }

                        logger.info('Subscribe Mobile:', 'token_balance_change', notificationToken, contractAddress);

                    }
                );

            });

        }], (err) => {

        });

    }

    /**
     *
     * @param {String} notificationToken
     * @param {String|null} contractAddress
     * @param {Array.<String>|null} addresses
     * @param {Function} next
     * @returns {*}
     */
    unsubscribeMobileTokenBalance(notificationToken, contractAddress, addresses, next) {
        return MobileTokenBalanceRepository.deleteToken(notificationToken, contractAddress, addresses, (err, key) => {
            return next(err, key);
        })
    }

    /**
     *
     * @param {String} contractAddress
     * @param {Number} amount
     * @param {String} language
     * @returns {*}
     */
    getMessage(contractAddress, amount, language) {

        let message = new gcm.Message();

        message.addNotification('title', i18n.__({phrase: 'notification.title', locale: language}));
        message.addNotification('body', i18n.__({phrase: 'notification.body', locale: language}, {amount: amount}));
        message.addNotification('sound', true);
        message.addNotification('icon', 'icon');
        message.addNotification('color', '#2e9ad0');

        message.addData('type', 'token_balance');
        message.addData('contract_address', contractAddress);

        return message;

    }

    /**
     *
     * @param {String} notificationToken
     * @param {String} contractAddress
     * @param {BigNumber} amountBN
     * @param {Number} decimals
     * @param {String} language
     * @param {Function} next
     */
    notifyToken(notificationToken, contractAddress, amountBN, decimals, language, next) {

        if (decimals && decimals > 0) {
            amountBN = amountBN.dividedBy('1e' + decimals).toString(10);
        }

        let message = this.getMessage(contractAddress, amountBN.toString(10), language);

        return this.notifier.send(message, { registrationTokens: [notificationToken]}, (err, response) => {

            if (err) {
                return next(err);
            }

            logger.info(err, response);

            if (response.failure) {

                logger.info('Failure. Delete token..', notificationToken);

                return MobileTokenBalanceRepository.deleteToken(notificationToken, null, null, (err) => {
                    return next(err);
                });

            }

            return next();

        });


    }

    /**
     *
     * @param {Object} diffBalances
     * @param {Object.<String, Object>} diffBalances.token
     * @param {{amount: Number, language: String}} diffBalances.token.contract
     * @param {Function} next
     * @returns {*}
     */
    notifyTokens(diffBalances, next) {

        let tokens = Object.keys(diffBalances);

        if (tokens.length) {

            return async.eachSeries(tokens, (token, callback) => {

                let contracts = Object.keys(diffBalances[token]);

                return async.eachSeries(contracts, (contract, callback) => {

                    return this.notifyToken(token, contract, diffBalances[token][contract].amount, diffBalances[token][contract].decimals, diffBalances[token][contract].language, () => {
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

    /**
     *
     * @return {*}
     */
    checkBalances() {

        let cursor = MobileTokenBalance.find().cursor(),
            document = null,
            contractsDecimals = {},
            diffBalances = {};

        return async.during(
            (callback) => {
                return cursor.next((error, doc) => {
                    document = doc;
                    return callback(null, document);
                });
            },
            (callback) => {

                let notificationToken = document.token_id,
                    contractAddress = document.contract_address,
                    language = document.language;

                return async.eachSeries(document.addresses, (addressObject, callback) => {

                    let address = addressObject.address,
                        previousBalance = addressObject.balance;

                    return this.tokenContract.getBalance(contractAddress, address, (err, data) => {

                        if (err || !data) {
                            return callback(err);
                        } else {

                            let currentBalance = data.balanceOf;
                            let currentBalanceBN = new BigNumber(currentBalance);
                            let previousBalanceBN = new BigNumber(previousBalance);

                            if (previousBalance !== currentBalance) {

                                return async.waterfall([(callback) => {

                                    return MobileTokenBalanceRepository.updateTokenAddressBalance(notificationToken, addressObject.id, currentBalance, (err) => {

                                        if (err) {
                                            return callback(err);
                                        }

                                        return callback();

                                    });

                                }, (callback) => {

                                    // if (previousBalance < currentBalance) {
                                    if (previousBalanceBN.lt(currentBalanceBN)) {

                                        if (!diffBalances[notificationToken]) {
                                            diffBalances[notificationToken] = {};
                                        }

                                        if (!diffBalances[notificationToken][contractAddress]) {
                                            diffBalances[notificationToken][contractAddress] = {
                                                language: language,
                                                amount: new BigNumber(0),
                                                decimals: 0
                                            };
                                        }

                                        // diffBalances[notificationToken][contractAddress].amount += (currentBalance - previousBalance);
                                        diffBalances[notificationToken][contractAddress].amount = diffBalances[notificationToken][contractAddress].amount.plus(currentBalanceBN.minus(previousBalanceBN));

                                        if (typeof contractsDecimals[contractAddress] !== "undefined") {
                                            diffBalances[notificationToken][contractAddress].decimals = contractsDecimals[contractAddress];
                                        } else {

                                            return this.tokenContract.getDecimals(contractAddress, (err, result) => {

                                                if (err) {
                                                    return callback(err);
                                                }

                                                contractsDecimals[contractAddress] = result.decimals;

                                                diffBalances[notificationToken][contractAddress].decimals = result.decimals;

                                                return callback();

                                            });

                                        }

                                    }

                                    return callback();

                                }], (err) => {
                                    return callback(err);
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