let logger = require('log4js').getLogger('History Controller'),
	async = require('async');


class HistoryController {

	constructor() {
        logger.info('Init');
	}
	
	getAddressHistoryList(cb) {
        return cb(null, []);
	}
	
	getAddressHistory(cb) {
        return cb(null, []);
	}

}

module.exports = HistoryController;

