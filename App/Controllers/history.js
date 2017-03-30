let logger = require('log4js').getLogger('History Controller'),
    InsightApi = require("../Services/InsightApi"),
    HistoryService = require("../Services/HistoryService"),
	async = require('async');


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
            return cb(null, []);
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

	    var MAX_LIMIT = 50;

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

        var items = [];

        if (history && history.items && history.items.length) {
            history.items.forEach(function (item) {
                var vout = [],
                    vin = [];

                item.vin.forEach(function (vIn) {

                    vin.push({
                        value: vIn.value,
                        address: vIn.addr
                    });

                });

                item.vout.forEach(function (vOut) {

                    if (vOut.scriptPubKey && vOut.scriptPubKey.addresses) {

                        vout.push({
                            value: vOut.value,
                            address: vOut.scriptPubKey.addresses[0] ? vOut.scriptPubKey.addresses[0] : null
                        });
                    }


                });

                items.push({
                    block_time: item.blocktime ? item.blocktime : null,
                    block_height: item.blockheight ? item.blockheight : null,
                    block_hash: item.blockhash ? item.blockhash : null,
                    tx_hash: item.txid,
                    amount: item.valueIn,
                    vout: vout,
                    vin: vin
                });
            });
        }



        return items;
    }

}

module.exports = HistoryController;

