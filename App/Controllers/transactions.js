let InsightApi = require("../Services/InsightApi"),
    logger = require('log4js').getLogger('Outputs Controller');


class TransactionsController {

    constructor() {
        logger.info('Init');
    }

    sendRawTransaction(cb, data) {

        let allowAbsurdFees = parseInt(data._post.allowHighFee) === 1;

        InsightApi.sendRawTransaction(data._post.data, allowAbsurdFees, (error, body) => {
            cb(error, body);
        });

    }

}

module.exports = TransactionsController;