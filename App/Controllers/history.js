let moment = require('moment'),
	logger = require('log4js').getLogger('History Controller'),
	async = require('async'),
	bitcoin = require('bitcoinjs-lib');

let Controllers = getControllers();
let Models = getModels();

class HistoryController {
	constructor() {
		this.getAddressHistory = this.getAddressHistory.bind(this);
	}
	
	getAddressHistory(cb, data) {
		let {address, limit, offset} = data._get;
		try {
			address = Controllers.utils.decodeAddress(address);
		} catch(e) {
			return cb(e.message);
		}
		offset = parseInt(offset);
		if(!offset || isNaN(offset)) {
			offset = 0;
		}
		limit = parseInt(limit);
		if(!limit || isNaN(limit)) {
			limit = 100;
		}
		
		Models.pubkey.getHistory(address, limit, offset, (err, result) => {
			if(err) return GlobalError('15:02', err, cb);
			result = result.map(row => {
				return {
					block_time: row.block_time,
					block_height: row.block_height,
					block_hash: row.block_hash.toString('hex'),
					tx_hash: row.tx_hash.toString('hex'),
					txin_pos: row.txin_pos,
					amount: row.amount,
					from_address: bitcoin.address.toBase58Check(row.from_address, 0),
					to_address: bitcoin.address.toBase58Check(row.to_address, 0)
				}
			});
			cb(null, result);
		});
	}
}

Controllers.history = new HistoryController();