let logger = require('log4js').getLogger('History Controller'),
    InsightApi = require("../Services/InsightApi"),
    HistoryService = require("../Services/HistoryService");


class HistoryController {

	constructor() {
        logger.info('Init');
	}
	
	getAddressHistoryList(cb, data) {
        var req = data.req,
            options = this._formatOptions(req.params.limit, req.params.offset),
            addresses = data._get.addresses && Array.isArray(data._get.addresses) ? data._get.addresses : [];

        if (addresses.length) {

            InsightApi.getAddressesHistory(addresses, options, (error, body) => {
                return cb(error, this._formatHistory(body));
            });

        } else {
            return cb(null, this._formatHistory(null));
        }

	}
	
	getAddressHistory(cb, data) {
	    var req = data.req,
            options = this._formatOptions(req.params.limit, req.params.offset);


	    InsightApi.getAddressesHistory([data._get.address], options, (error, body) => {
            return cb(error, this._formatHistory(body));
        });

	}

	_formatOptions(limit, offset) {

	    const MAX_LIMIT = 50;

        limit = parseInt(limit, 10);
        offset = parseInt(offset, 10);

        if (isNaN(limit)) {
            limit = MAX_LIMIT;
        }

        if (isNaN(offset)) {
            offset = 0
        }

        limit = Math.abs(limit);
        offset = Math.abs(offset);

        if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }

        return {
            from: offset,
            to: offset + limit
        };
    }

    _formatHistory(history) {
        return HistoryService.formatHistory(history);
    }

}

module.exports = HistoryController;

