let InsightApiRepository = require("../Repositories/InsightApiRepository"),
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

        return InsightApiRepository.sendRawTransaction(data._post.data, allowAbsurdFees, (error, body) => {
            cb(error, body);
        });

    }

    getTransaction(cb, data) {

        if (!data.req.params.txhash) {
            return cb('Bad Request', 400);
        }

        return TransactionService.getTransaction(data.req.params.txhash, (err, result) => {
            return cb(err, result);
        });

    }

    getTransactionReceipt(cb, data) {

        if (!data.req.params.txhash) {
            return cb('Bad Request', 400);
        }

        return InsightApiRepository.getTransactionReceipt(data.req.params.txhash, (error, body) => {
            cb(error, body);
        });

    }

}

Controllers.transactions = new TransactionsController();