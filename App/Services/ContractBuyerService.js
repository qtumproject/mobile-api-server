const ContractsRepository = require('../Repositories/ContractsRepository');
const ReceiveApiRepository = require('../Repositories/ReceiveApiRepository');
const ContractPurchaseRepository = require('../Repositories/ContractPurchaseRepository');
const async = require('async');
const crypto = require('crypto');

class ContractBuyerService {

    static buyContract(contractId, next) {

        console.log(contractId);

        return ContractsRepository.fetchContract(contractId, (err, contract) => {

            if (err) {
                return next(err);
            }

            if (!contract) {
                return next("Not Found", 404);
            }

            if (!contract.publisher_address) {
                return next("Empty Publisher address", 422);
            }

            if (!contract.price) {
                return next("Empty Price", 422);
            }

            return async.waterfall([(callback) => {
                return ReceiveApiRepository.createNewReceiveTransaction(contract.publisher_address, contract.price, (err, data) => {
                    return callback(err, data);
                });
            }, (data, callback) => {
                return crypto.randomBytes(96, (err, buffer) => {
                    return callback(err, {
                        address: data.address,
                        amount: data.amount,
                        request_id: data._id,
                        access_token: buffer.toString('hex'),
                        status: data.status,
                        contract_id: contractId
                    });
                });
            }, (data, callback) => {
                return ContractPurchaseRepository.addPurchase(data, (err, purchase) => {
                    return callback(err, purchase);
                });
            }], (err, purchase) => {
                return next(err, purchase);
            });

        });

    }

}

module.exports = ContractBuyerService;