let InsightApi = require("../Repositories/InsightApi"),
    logger = require('log4js').getLogger('Blockchain Controller');

let Controllers = getControllers();

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

Controllers.blockchain = new BlockchainController();