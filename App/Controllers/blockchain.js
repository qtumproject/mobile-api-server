let InsightApiRepository = require("../Repositories/InsightApiRepository"),
    logger = require('log4js').getLogger('Blockchain Controller');

let Controllers = getControllers();

class BlockchainController {

	constructor() {
        logger.info('Init');
    }

	getInfo(cb) {
        return InsightApiRepository.getInfo((error, body) => {
            cb(error, body && body.info ? body.info : {});
		});
	}

}

Controllers.blockchain = new BlockchainController();