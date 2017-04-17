let InsightApi = require("../Repositories/InsightApi"),
    HistoryService = require("../Services/HistoryService"),
    logger = require('log4js').getLogger('Transactions Controller');

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

        InsightApi.getTrx(data.req.params.txhash, (err, data) => {

            if (err) return cb(err);

            return cb(null, data ? HistoryService.formatHistoryItem(data) : null);

        });
    }

}

Controllers.transactions = new TransactionsController();