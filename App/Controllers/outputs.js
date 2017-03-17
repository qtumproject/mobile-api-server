let async = require('async'),
	logger = require('log4js').getLogger('Outputs Controller'),
	InsightApi = require("../Services/InsightApi");


class OutputsControllers {

    constructor() {
        logger.info('Init');
    }

    getUnspentByAddress(cb, data) {

        InsightApi.getUnspentAddresses([data._get.address], (error, body) => {
            cb(error, body);
    	});

	}

	getUnspentByAddresses(cb, data) {

		let addresses = data._get.addresses && Array.isArray(data._get.addresses) ? data._get.addresses : [];

		if (addresses.length) {

            InsightApi.getUnspentAddresses(addresses, (error, body) => {
                cb(error, body);
        	});

		} else {
            cb(error, []);
		}

	}

}

module.exports = OutputsControllers;