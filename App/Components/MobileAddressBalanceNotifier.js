const _ = require('lodash');
const logger = require('log4js').getLogger('MobileAddressBalanceNotifier');
const InsightApi = require("../Repositories/InsightApi");
const MobileAddressBalanceRepository = require("../Repositories/MobileAddressBalanceRepository");
const async = require('async');
const config = require('../../config/main.json');
const gcm = require('node-gcm');

class MobileAddressBalanceNotifier {

    constructor(socket, socketClient) {

        logger.info('Init');
        this.sender = new gcm.Sender(config.FIREBASE_SERVER_TOKEN);

        this.socket = socket;
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

                let addresses = {};

                data.transactions.forEach((transaction) => {

                    if (transaction.vout) {
                        transaction.vout.forEach((vOut) => {
                            if (vOut && vOut.scriptPubKey && vOut.scriptPubKey.addresses && vOut.scriptPubKey.addresses.length) {
                                addresses[vOut.scriptPubKey.addresses[0]] = vOut.scriptPubKey.addresses[0];
                            }
                        });
                    }

                    if (transaction.vin) {
                        transaction.vin.forEach((vIn) => {
                            if (vIn.addr) {
                                addresses[vIn.addr] = vIn.addr;
                            }
                        });
                    }
                });

                this.notifyBalanceChanged(Object.keys(addresses));

            }

        });

    }

    getMessage() {
        let message = new gcm.Message();

        message.addNotification('title', 'QTUM');
        message.addNotification('body', 'Balance changed!');
        message.addNotification('sound', true);
        message.addNotification('icon', 'icon');
        message.addNotification('color', '#a57eec');

        return message;

    }

    notifyBalanceChanged(addresses) {

        if (!addresses || !addresses.length) {
            return;
        }

        return async.waterfall([(callback) => {
            return MobileAddressBalanceRepository.fetchByAddresses(addresses, (err, tokens) => {
                return callback(err, tokens)
            });
        }, (tokens, callback) => {

            if (!tokens.length) {
                return callback();
            }

            return async.waterfall([(callback) => {

                let message = this.getMessage(),
                    notifyTokens = [];

                tokens.forEach((tokenObject) => {
                    notifyTokens.push(tokenObject.token_id);
                });

                return this.sender.send(message, { registrationTokens: notifyTokens}, (err, response) => {
                    return callback(err, response, notifyTokens);
                });

            }, (response, notifyTokens, callback) => {

                logger.info(response);

                if (!response.failure) {
                    logger.info('DONE', notifyTokens);
                    return callback();
                }

                return async.eachOfSeries(response.results, (res, idx, callback) => {

                    let tokenId = notifyTokens[idx];

                    if (!res.error) {
                        return callback();
                    }

                    logger.info('Failure. Delete token..', tokenId);

                    return MobileAddressBalanceRepository.deleteToken(tokenId, null, (err) => {
                        return callback(err);
                    });

                }, (err) => {
                    return callback(err);
                });

            }], (err) => {
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

    subscribeAddress(tokenId, addresses) {

        if (!_.isArray(addresses)) {
            return false;
        }

        return async.waterfall([(callback) => {
            return MobileAddressBalanceRepository.fetchById(tokenId, (err, token) => {
                return callback(err, token);
            });
        }, (token, callback) => {

            let newAddresses = [],
                newAddressesObjects = [];

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

                return InsightApi.getAddressesBalance([address], (err, data) => {

                    if (err) {
                        return false;
                    }

                    let balance;

                    if (err || !data) {
                        balance = {
                            address: address,
                            balance: 0
                        };
                    } else {
                        balance = {
                            address: address,
                            balance: data.balance
                        };
                    }

                    newAddressesObjects.push(balance);

                    return callback(err);

                });

            }, (err) => {

                if (err) {
                    return callback(err);
                }

                return MobileAddressBalanceRepository.createOrUpdateToken(tokenId,
                    newAddressesObjects,
                    (err) => {
                        return callback(err);


                    }
                );

            });

        }], (err) => {

            if (err) {
                logger.error('Subscribe Mobile Error:', 'balance_change', err);
                return false;
            }

            logger.info('Subscribe Mobile:', 'balance_change', tokenId);

        });

    };

    unsubscribeAddress(tokenId, addresses) {
        return MobileAddressBalanceRepository.deleteToken(tokenId, addresses, () => {
            logger.info('unsubscribe:', 'balance_subscribe', tokenId, addresses);
        });
    };

}

module.exports = MobileAddressBalanceNotifier;