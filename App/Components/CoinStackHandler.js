const async = require('async');

const CoinStackRepository = require('../Repositories/CoinStackRepository');
const TransactionService = require('../Services/TransactionService');

class CoinStackHandler {

	static handleCoinStack(height, addresses, next) {
		async.waterfall([
			(callback) => CoinStackRepository.addBlockAddresses({ height, addresses }, (err) => callback(err)),
			(callback) => CoinStackRepository.fetchAndRemoveOldestDocuments(height, (err, response) => {
				console.log(JSON.stringify(response, null, 2));
				return callback();
			})
		], (err) => next(err));
	}

	static checkConfirmedCoins(height, next) {
		return UnconfirmedBalanceRepository.fetchAndRemoveOldestDocuments(height, (err, response) => {
			if (err) {
				return next(err);
			}

			if (response && response.length && response.addresses) {
				const { addresses } = response.addresses;
				return next(null, addresses);
			}

			return next(err, []);
		})
	}

	static handleUnconfirmedCoins(transactions, next) {
		return async.waterfall([
			(callback) =>
				(callback) => this.checkConfirmedCoins(block.height, (err, addresses) => callback(err, addresses))
		],
			(err, addresses) => next(err, addresses)
		);
	}

	static processCoinStackTransaction(transaction) {
		const coinStackAddresses = [];
		const { vout } = transaction;

		if (!vout || !vout.length) {
			return [];
		}

		vout.forEach((item, index) => {
			if (item && item.scriptPubKey && item.scriptPubKey.addresses && item.scriptPubKey.addresses.length) {
				const address = item.scriptPubKey.addresses;
				coinStackAddresses.push(...address);
			}
		});

		return coinStackAddresses;
	}

}


module.exports = CoinStackHandler;
