const CoinStack = require('../Models/CoinStack');

const STACK_PERIOD = 500;

class CoinStackRepository {

	/**
 	*
 	* @param {Array<string>} blockInfo.addresses
 	* @param {Number} blockInfo.blockHeight
 	* @param {Function} next
 	*/
	static addBlockAddresses({ blockHeight, addresses }, next) {
		
		if (!addresses || !addresses.length) {
			return next();
		}

		return CoinStack.create({ addresses, block_height: blockHeight }, (err, key) => next(err, key));
	}

	/**
 	*
 	* @param {Number} blockHeight
 	* @param {Function} next
 	*/
	static fetchAndRemoveOldestDocuments(blockHeight, next) {

		const query = { block_height: { $lte: blockHeight - STACK_PERIOD } };

		return CoinStack.find(query, { addresses: 1 }, (err, addresses) => {

			if (err) {
				return next(err);
			}

			return CoinStack.deleteMany(query, (err) => next(err, addresses));
		});
	}

}

module.exports = CoinStackRepository;
