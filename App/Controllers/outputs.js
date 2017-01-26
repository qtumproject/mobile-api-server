let async = require('async'),
	logger = require('log4js').getLogger('Outputs Controller');

let Controllers = getControllers();
let Models = getModels();

class OutputsControllers {
	constructor() {}
	
	getUnspent(cb, data) {
		let address = data._get.address;
		let addressBytes;
		try {
			addressBytes = Controllers.utils.decodeAddress(address);
		} catch(e) {
			return cb(e.message);
		}
		
		Models.unspent_txout_detail.findAll({
			where: {
				pubkey_hash: addressBytes
			}
		}).then(list => {
			list = list.map(row => {
				return {
					amount: row.amount,
					vout: row.vout,
					tx_id: row.tx_id,
					block_id: row.block_id,
					block_height: row.block_height,
					txout_id: row.txout_id,
					txout_scriptPubKey: row.txout_scriptPubKey.toString('hex'),
					tx_hash: row.tx_hash.toString('hex'),
					block_hash: row.block_hash.toString('hex'),
					pubkey_hash: row.pubkey_hash.toString('hex')
				}
			});
			return cb(null, list);
		}).catch(err => {
			return GlobalError('12:27', err, cb);
		});
	}
}

Controllers.outputs = new OutputsControllers();