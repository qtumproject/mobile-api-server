let Sequelize = require('sequelize'),
	logger = require('log4js').getLogger('Model pubkey');

module.exports = (sequelize) => {
	let chain = sequelize.define('chain', {
		chain_id: {
			type: Sequelize.DECIMAL, primaryKey: true
		},
		chain_address_version: {
			type: Sequelize.STRING.BINARY
		},
		chain_name: {
			type: Sequelize.STRING
		}
	}, {
		createdAt: false,
		updatedAt: false,
		deletedAt: false,
		freezeTableName: true
	});
	
	
	let Models = {chain: chain};
	return chain;
};

