let InsightApi = require("../Repositories/InsightApi"),
    TransactionService = require("../Services/TransactionService"),
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

        TransactionService.getTransaction(data.req.params.txhash, (err, result) => {
            return cb(err, result);
        });

    }

}

Controllers.transactions = new TransactionsController();