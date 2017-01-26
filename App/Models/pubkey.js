let Sequelize = require('sequelize'),
	logger = require('log4js').getLogger('Model pubkey');

module.exports = (sequelize) => {
	let pubkey = sequelize.define('pubkey', {
		pubkey_id: {
			type: Sequelize.DECIMAL, primaryKey: true
		},
		pubkey_hash: {
			type: Sequelize.STRING.BINARY
		},
		pubkey: {
			type: Sequelize.STRING.BINARY
		}
	}, {
		createdAt: false,
		updatedAt: false,
		deletedAt: false,
		freezeTableName: true
	});
	
	pubkey.getHistory = (address, limit, offset, cb) => {
		let query = `
			SELECT
	            b.block_nTime as block_time,
	            b.block_height,
	            b.block_hash,
	            tx.tx_hash,
	            txin.txin_pos,
	            from_pubkey.pubkey_hash as from_address,
	            to_pubkey.pubkey_hash as to_address,
	            IF(from_pubkey.pubkey_hash = :address, -prevout.txout_value, txout.txout_value) as amount
	        FROM chain_candidate cc
	        JOIN block b ON (b.block_id = cc.block_id)
	        JOIN block_tx ON (block_tx.block_id = b.block_id)
	        JOIN tx ON (tx.tx_id = block_tx.tx_id)
	        JOIN txin ON (txin.tx_id = tx.tx_id)
	        JOIN txout prevout ON (txin.txout_id = prevout.txout_id)
	        JOIN txout ON (txout.tx_id = tx.tx_id)
	        JOIN pubkey from_pubkey ON (from_pubkey.pubkey_id = prevout.pubkey_id)
	        JOIN pubkey to_pubkey ON (to_pubkey.pubkey_id = txout.pubkey_id)
	        WHERE 
	            (from_pubkey.pubkey_hash = :address OR to_pubkey.pubkey_hash = :address) 
	        AND 
	            cc.in_longest = 1 
	        LIMIT :limit OFFSET :offset
		`;
		sequelize.query(query, {replacements: {address, limit, offset}, type: sequelize.QueryTypes.SELECT}).then(result => {
			cb(null, result);
		}).catch(err => {
			cb(err);
		});
	};
	
	let Models = {pubkey: pubkey};
	return pubkey;
};

