const _ = require('lodash');
const logger = require('log4js').getLogger('MobileAddressBalanceNotifier');
const InsightApiRepository = require("../Repositories/InsightApiRepository");
const MobileAddressBalanceRepository = require("../Repositories/MobileAddressBalanceRepository");
const async = require('async');
const config = require('../../config/main.json');
const gcm = require('node-gcm');
const BigNumber = require('bignumber.js');
const i18n = require("i18n");

class MobileAddressBalanceNotifier {

    constructor(socketClient) {

        logger.info('Init');

        this.notifier = new gcm.Sender(config.FIREBASE_SERVER_TOKEN);
        this.socketClient = socketClient;

        this.initRemoteSocket();

    }

    initRemoteSocket() {

        this.socketClient.on('connect', () => {
            logger.info('connect socketClient');
            this.subscribeRemoteQtumRoom();
        });

        this.socketClient.on('disconnect', () => {
            logger.info('disconnect socketClient');
        });

        this.subscribeToQtumBlock();

    }

    subscribeToQtumBlock() {

        this.socketClient.on('qtum/block', (data) => {

            if (data && data.transactions) {

                let addressesHash = {};

                data.transactions.forEach((transaction) => {

                    let vinAddresses = {};

                    if (transaction.vin) {
                        transaction.vin.forEach((vIn) => {
                            if (vIn.addr) {
                                vinAddresses[vIn.addr] = vIn.addr;
                            }
                        });
                    }

                    if (transaction.vout) {
                        transaction.vout.forEach((vOut) => {
                            if (vOut && vOut.scriptPubKey && vOut.scriptPubKey.addresses && vOut.scriptPubKey.addresses.length) {

                                if (!vinAddresses[vOut.scriptPubKey.addresses[0]]) {

                                    if (!addressesHash[vOut.scriptPubKey.addresses[0]]) {
                                        addressesHash[vOut.scriptPubKey.addresses[0]] = {
                                            amount: new BigNumber(vOut.value),
                                            transactions: []
                                        };
                                    } else {
                                        addressesHash[vOut.scriptPubKey.addresses[0]].amount = addressesHash[vOut.scriptPubKey.addresses[0]].amount.plus(new BigNumber(vOut.value));
                                    }

                                    if (addressesHash[vOut.scriptPubKey.addresses[0]].transactions.indexOf(transaction.txid) === -1) {
                                        addressesHash[vOut.scriptPubKey.addresses[0]].transactions.push(transaction.txid);
                                    }

                                }

                            }
                        });
                    }

                });

                return this.notifyBalanceChanged(addressesHash);

            }

        });

    }

    /**
     *
     * @param {Object} data
     * @param {BigNumber} data.amount
     * @param {Array.<String>} data.transactions
     * @param {String} language
     * @returns {*}
     */
    getMessage(data, language) {
        let message = new gcm.Message();

        message.addNotification('title', i18n.__({phrase: 'notification.title', locale: language}));
        message.addNotification('body', i18n.__({phrase: 'notification.body', locale: language}, {amount: data.amount.toString(10)}));
        message.addNotification('sound', true);
        message.addNotification('icon', 'icon');
        message.addNotification('color', '#2e9ad0');

        message.addData('type', 'balance');
        message.addData('transactions', data.transactions);

        return message;

    }

    /**
     *
     * @param {Object.<String, {amount: BigNumber, transactions: Array.<String>}>} addressesHash
     * @returns {*}
     */
    notifyBalanceChanged(addressesHash) {

        let addresses = Object.keys(addressesHash);

        if (!addresses || !addresses.length) {
            return;
        }

        return async.waterfall([(callback) => {
            return MobileAddressBalanceRepository.fetchByAddresses(addresses, (err, addresses) => {
                return callback(err, addresses);
            });
        }, (addresses, callback) => {

            if (!addresses.length) {
                return callback();
            }

            return async.eachSeries(addresses, (addressObject, callback) => {

                let languageHash = {};

                addressObject.tokens.forEach((tokenObject) => {

                    if (!languageHash[tokenObject.language]) {
                        languageHash[tokenObject.language] = [];
                    }

                    languageHash[tokenObject.language].push(tokenObject.token);

                });

                let languageKeys = Object.keys(languageHash);

                return async.eachSeries(languageKeys, (languageKey, callback) => {

                    let notifyTokens = languageHash[languageKey];

                    return async.waterfall([(callback) => {

                        let message = this.getMessage(addressesHash[addressObject.address], languageKey);

                        return this.notifier.send(message, { registrationTokens: notifyTokens}, (err, response) => {

                            if (err) {
                                logger.error('notifier.send', err);
                            }

                            return callback(err, response, notifyTokens);
                        });

                    }, (response, notifyTokens, callback) => {

                        logger.info(response);

                        if (!response.failure) {
                            logger.info('Done', notifyTokens);
                            return callback();
                        }

                        return async.eachOfSeries(response.results, (res, idx, callback) => {

                            let notificationToken = notifyTokens[idx];

                            if (!res.error) {
                                return callback();
                            }

                            logger.info('Failure. Delete token..', notificationToken);

                            return MobileAddressBalanceRepository.deleteToken(notificationToken, null, (err) => {
                                return callback(err);
                            });

                        }, (err) => {
                            return callback(err);
                        });

                    }], (err) => {
                        return callback(err);
                    });

                }, (err) => {
                    return callback(err);
                });

            }, (err) => {
                return callback(err);
            });

        }], (err) => {

            if (err) {
                logger.error(err);
                return false;
            }

        });

    }

    subscribeRemoteQtumRoom() {
        this.socketClient.emit('subscribe', 'qtum');
    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Object} options
     * @param {String|null} options.notificationToken
     * @param {String|null} options.prevToken
     * @param {String|null} options.language
     * @returns {*}
     */
    subscribeAddress(addresses, options) {

        let notificationToken = options.notificationToken,
            prevToken = options.prevToken,
            language = options.language;

        if (!_.isArray(addresses)) {
            return false;
        }

        return async.waterfall([(callback) => {

            if (prevToken) {
                return MobileAddressBalanceRepository.deleteToken(prevToken, null, (err) => {
                    return callback(err);
                });
            } else {
                return callback();
            }

        }, (callback) => {

            return MobileAddressBalanceRepository.createOrUpdateAddresses(notificationToken,
                addresses,
                language,
                (err) => {
                    return callback(err);
                }
            );

        }], (err) => {

            if (err) {
                logger.error('Subscribe Mobile Error:', 'balance_change', err);
                return false;
            }

            return logger.info('Subscribe Mobile:', 'balance_change', notificationToken);

        });

    };

    /**
     *
     * @param {String} notificationToken
     * @param {Array.<String>|null} addresses
     * @returns {*}
     */
    unsubscribeAddress(notificationToken, addresses) {
        return MobileAddressBalanceRepository.deleteToken(notificationToken, addresses, () => {
            return logger.info('unsubscribe:', 'balance_subscribe', notificationToken, addresses);
        });
    };

}

module.exports = MobileAddressBalanceNotifier;