const CoinStack = require('../Models/CoinStack');

class CoinStackRepository {

	/**
 	*
 	* @param {Object} blockInfo
 	* @param {Array<string>} blockInfo.addresses
 	* @param {Number} blockInfo.blockHeight
 	* @param {Function} next
 	*/
	static addBlockAddresses({ addresses, blockHeight }, next) {
		if (addresses.length === 0) {
			return next();
		}

		CoinStack.create({ addresses, blockHeight }, (err, key) => next(err));
	}

	
	/**
 	*
 	* @param {Number} blockHeight
 	* @param {Function} next
 	*/
	static fetchAndRemoveOldestDocument(blockHeight, next) {
		CoinStack
			.findOneAndRemove({ block_height: blockHeight }, (err, removedDoc) => next(err, removedDoc));
	}

	/**
 	*
 	* @param {Number} blockHeight
 	* @param {Function} next
 	*/
	static fetchAndRemoveOldestDocuments(blockHeight, next) {
		
		const query = { block_height: { $lte: blockHeight - 500 } };

		CoinStack.find(query, (err, response) => {

			if (err) {
				return next(err);
			}

			CoinStack.deleteMany(query, (err) => next(err, response));
		});
	}

}

module.exports = CoinStackRepository;
