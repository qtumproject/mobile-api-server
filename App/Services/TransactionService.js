const async = require('async');
const HistoryService = require('./HistoryService');
const InsightApi = require('../Repositories/InsightApi');


class TransactionService {

    static getTransaction(txId, next) {

        async.waterfall([
            (callback) => {
                InsightApi.getTrx(txId, (err, data) => {
                    return callback(err, data);
                });
            },
            (body, callback) => {

                if (body) {
                    HistoryService.formatHistoryItem(body, (err, result) => {
                        return callback(err, result);
                    });
                } else {
                    callback("Transaction not found", null);
                }

            }
        ], (err, result) => {
            return next(err, result);
        });

    }
}

module.exports = TransactionService;