const async = require('async');
const _ = require('lodash');

const CoinStackRepository = require('../Repositories/CoinStackRepository');
const TransactionService = require('../Services/TransactionService');

class CoinStackHandler {

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

	static processCoinStackTransaction(transaction) {
		let coinStackAddresses = [];
		let { vout } = transaction;

		if (!vout || !vout.length) {
			return [];
		}

		vout.forEach((item, index) => {
			if (item && item.scriptPubKey && item.scriptPubKey.addresses && item.scriptPubKey.addresses.length) {
				const address = item.scriptPubKey.addresses;
				coinStackAddresses = _.union(coinStackAddresses, address);
			}
		});

		return coinStackAddresses;
	}

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
