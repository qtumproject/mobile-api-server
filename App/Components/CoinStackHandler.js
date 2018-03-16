const async = require('async');
const _ = require('lodash');

const CoinStackRepository = require('../Repositories/CoinStackRepository');
const TransactionService = require('../Services/TransactionService');

class CoinStackHandler {

	/**
 	*
 	* @param {Number} height
 	* @param {Array<string>} addresses
 	* @param {Function} next
 	*/
	static handleCoinStack(height, addresses, next) {
		return async.waterfall([
			(callback) => CoinStackRepository.addBlockAddresses({ blockHeight: height, addresses }, (err) => callback(err)),
			(callback) => CoinStackRepository.fetchAndRemoveOldestDocuments(height, (err, coinStacks) => {
				if (err || !coinStacks || !coinStacks.length) {
					return callback(err, []);
				}

				const uniqAddresses = this.getAddressesFromRemovedStacks(coinStacks);

				return callback(null, uniqAddresses);
			})
		], (err, uniqAddresses) => next(err, uniqAddresses));
	}

	/**
 	*
	* @param {Array.<Object>} coinStacks
	* @returns {Array.<String>}
 	*/
	static getAddressesFromRemovedStacks(coinStacks) {

		if (coinStacks.length === 1) {
			return coinStacks[0].addresses;
		}

		const uniqAddresses = coinStacks
			.reduce(({ addresses: currAddresses }, { addresses: nextAddresses }) => {
				return _.union(currAddresses, nextAddresses);
			});

		return uniqAddresses;
	}

}


module.exports = CoinStackHandler;
