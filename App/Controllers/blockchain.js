let InsightApiRepository = require("../Repositories/InsightApiRepository"),
    _ = require("lodash"),
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

    getFeePerKb(cb, data) {

        let req = data.req,
            nBlocks = parseInt(req.query.nBlocks);

        if (_.isNaN(nBlocks)) {
            nBlocks = 6;
        }

        return InsightApiRepository.minEstimateFee(nBlocks, (error, body) => {
            return cb(error, body);
		});
	}

    fetchDgpInfo(cb) {
        return InsightApiRepository.getDgpinfo((error, body) => {
            return cb(error, body);
        });
    }


}

Controllers.blockchain = new BlockchainController();