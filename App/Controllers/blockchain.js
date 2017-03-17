let InsightApi = require("../Services/InsightApi"),
    logger = require('log4js').getLogger('Blockchain Controller');


class BlockchainController {

	constructor() {
        logger.info('Init');
    }

	getInfo(cb) {

		InsightApi.getInfo((error, body) => {
            cb(error, body && body.info ? body.info : {});
		});

	}
}

module.exports = BlockchainController;