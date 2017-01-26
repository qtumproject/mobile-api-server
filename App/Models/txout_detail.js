let Sequelize = require('sequelize');

module.exports = (sequelize) => {
	let txout_detail = sequelize.define('txout_detail', {
		chain_id: {
			type: Sequelize.DECIMAL
		},
		in_longest: {
			type: Sequelize.DECIMAL
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
		tx_pos: {
			type: Sequelize.DECIMAL
		},
		tx_id: {
			type: Sequelize.DECIMAL
		},
		tx_hash: {
			type: Sequelize.STRING.BINARY
		},
		tx_lockTime: {
			type: Sequelize.DECIMAL
		},
		tx_version: {
			type: Sequelize.DECIMAL
		},
		tx_size: {
			type: Sequelize.DECIMAL
		},
		txout_id: {
			type: Sequelize.DECIMAL
		},
		txout_pos: {
			type: Sequelize.DECIMAL
		},
		txout_value: {
			type: Sequelize.DECIMAL
		},
		txout_scriptPubKey: {
			type: Sequelize.STRING.BINARY
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
	txout_detail.removeAttribute('id');
	let Models = {txout_detail: txout_detail};
	return txout_detail;
};