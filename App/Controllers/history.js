let logger = require('log4js').getLogger('History Controller'),
    InsightApiRepository = require("../Repositories/InsightApiRepository"),
    HistoryService = require("../Services/HistoryService"),
    async = require('async');

let Controllers = getControllers();

class HistoryController {

	constructor() {
        logger.info('Init');
	}
	
	getAddressHistoryList(cb, data) {

        let req = data.req,
            options = this._formatOptions(req.params.limit, req.params.offset),
            addresses = data._get.addresses && Array.isArray(data._get.addresses) ? data._get.addresses : [];

        if (addresses.length) {

            return async.waterfall([
                (callback) => {
                    return InsightApiRepository.getAddressesHistory(addresses, options, (error, body) => {
                       return callback(error, body);
                    });
                },
                (body, callback) => {
                    return this._formatHistory(body, (err, result) => {
                        return callback(err, result);
                    });
                }
            ], (err, result) => {
                return cb(err, result);
            });

        } else {
            return this._formatHistory(null, (err, result) => {
                return cb(err, result);
            });
        }

	}
	
	getAddressHistory(cb, data) {
	    let req = data.req,
            options = this._formatOptions(req.params.limit, req.params.offset);

        async.waterfall([
            (callback) => {
                return InsightApiRepository.getAddressesHistory([data._get.address], options, (error, body) => {
                    return callback(error, body);
                });
        },
            (body, callback) => {
                return this._formatHistory(body, (err, result) => {
                    return callback(err, result);
                });
            }
        ], (err, result) => {
            return cb(err, result);
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

    _formatHistory(history, cb) {
        return HistoryService.formatHistory(history, cb);
    }

}

Controllers.history = new HistoryController();