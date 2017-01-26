let Sequelize = require('sequelize');

module.exports = (sequelize) => {
	let unspent_txout_detail = sequelize.define('unspent_txout_detail', {
		amount: {
			type: Sequelize.DECIMAL
		},
		txout_scriptPubKey: {
			type: Sequelize.STRING.BINARY
		},
		vout: {
			type: Sequelize.DECIMAL
		},
		tx_id: {
			type: Sequelize.DECIMAL
		},
		tx_hash: {
			type: Sequelize.STRING.BINARY
		},
		block_id: {
			type: Sequelize.DECIMAL
		},
		block_hash: {
			type: Sequelize.STRING.BINARY
		},
		block_height: {
			type: Sequelize.DECIMAL
		},
		txout_id: {
			type: Sequelize.DECIMAL
		},
		pubkey_id: {
			type: Sequelize.DECIMAL
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
	unspent_txout_detail.removeAttribute('id');
	let Models = {unspent_txout_detail};
	return unspent_txout_detail;
};