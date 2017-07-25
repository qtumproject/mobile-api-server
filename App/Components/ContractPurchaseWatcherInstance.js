const logger = require('log4js').getLogger('ContractPurchaseWatcher');
const async = require('async');
const ContractPurchase = require('../Models/ContractPurchase');
const ReceiveApiRepository = require('../Repositories/ReceiveApiRepository');
const ContractPurchaseRepository = require('../Repositories/ContractPurchaseRepository');
const ContractsRepository = require('../Repositories/ContractsRepository');
const InsightApiRepository = require('../Repositories/InsightApiRepository');
const EventEmitter = require('events').EventEmitter;
const WATCHER_TIMEOUT = 20000;

class ContractPurchaseWatcher {

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    start() {

        let cursor = ContractPurchase.find({status: { $nin: [ ContractPurchase.STATUSES.FINISHED ] } }).cursor(),
            document = null;

        return async.during(
            (callback) => {
                return cursor.next((error, doc) => {
                    document = doc;
                    return callback(null, document);
                });
            },
            (callback) => {

                let request_id = document.request_id;

                return async.waterfall([(callback) => {

                    return ReceiveApiRepository.fetchTransactionById(request_id, (err, transaction) => {
                        return callback(err, transaction);
                    });

                }, (transaction, callback) => {

                    if (transaction.status === document.status) {
                        return callback();
                    }

                    if (transaction.status !== ContractPurchase.STATUSES.FINISHED) {
                        return ContractPurchaseRepository.updateStatus(document._id, transaction.status, (err) => {
                            return callback(err);
                        });
                    }

                    if (!transaction.tx_hash_receive) {
                        return callback('transaction.tx_hash_receive is empty');
                    }

                    /**
                     * if status === ContractPurchase.STATUSES.FINISHED
                     */
                    return async.waterfall([(callback) => {
                        return InsightApiRepository.getTrx(transaction.tx_hash_receive, (err, trx) => {
                            return callback(err, trx)
                        });
                    }, (trx, callback) => {

                        let fromAddresses = [];

                        trx.vin.forEach((vin) => {
                            if (vin.addr && fromAddresses.indexOf(vin.addr) === -1) {
                                fromAddresses.push(vin.addr);
                            }
                        });

                        if (!fromAddresses.length) {
                            return callback('fromAddresses is empty');
                        }

                        return async.waterfall([(callback) => {
                            return ContractPurchaseRepository.finishPurchase(document._id, fromAddresses, transaction.tx_transfer_created_at, transaction.status, (err, result) => {

                                if (err) {
                                    return callback(err);
                                }

                                this.eventEmitter.emit('contract_purchase', result);

                                return callback();
                            });
                        }, (callback) => {

                            return ContractsRepository.incrementCountBuy(document.contract_id, (err) => {
                                return callback(err);
                            });

                        }], (err) => {
                            return callback(err);
                        });

                    }], (err) => {
                        return callback(err);
                    });

                }], (err) => {
                    return callback(err);
                });

            },
            (err) => {

                if (err) {
                    logger.error(err);
                }

                return setTimeout(() => {
                    this.start();
                }, WATCHER_TIMEOUT);

            }
        );

    }

}

module.exports = new ContractPurchaseWatcher();