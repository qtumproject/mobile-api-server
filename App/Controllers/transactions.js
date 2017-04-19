let InsightApi = require("../Repositories/InsightApi"),
    HistoryService = require("../Services/HistoryService"),
    logger = require('log4js').getLogger('Transactions Controller'),
    async = require('async');

let Controllers = getControllers();

class TransactionsController {

    constructor() {
        logger.info('Init');
    }

    sendRawTransaction(cb, data) {

        let allowAbsurdFees = parseInt(data._post.allowHighFee) === 1;

        if (!data._post.data) {
            return cb('Bad Request', 400);
        }

        InsightApi.sendRawTransaction(data._post.data, allowAbsurdFees, (error, body) => {
            cb(error, body);
        });

    }

    getTransaction(cb, data) {


        async.waterfall([
            (callback) => {
                InsightApi.getTrx(data.req.params.txhash, (err, data) => {
                    return callback(err, data);
                });
            },
            (body, callback) => {

                if (body) {
                    HistoryService.formatHistoryItem(body, (err, result) => {
                        return callback(err, result);
                    });
                } else {
                    callback(null, null)
                }

            }
        ], (err, result) => {
            return cb(err, result);
        });

    }

}

Controllers.transactions = new TransactionsController();