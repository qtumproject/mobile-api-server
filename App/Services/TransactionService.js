const async = require('async');
const HistoryService = require('./HistoryService');
const InsightApiRepository = require('../Repositories/InsightApiRepository');

class TransactionService {

    /**
     *
     * @param {String} txId
     * @param {Function} next
     * @returns {*}
     */
    static getTransaction(txId, next) {

        return async.waterfall([
            (callback) => {
                return InsightApiRepository.getTrx(txId, (err, data) => {
                    return callback(err, data);
                });
            },
            (body, callback) => {

                if (body) {
                    return HistoryService.formatHistoryItem(body, (err, result) => {
                        return callback(err, result);
                    });
                } else {
                    return callback("Transaction not found", null);
                }

            }
        ], (err, result) => {
            return next(err, result);
        });

    }

}

module.exports = TransactionService;