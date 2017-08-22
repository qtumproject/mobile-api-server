const ContractPurchase = require('../Models/ContractPurchase');
const TRENDING_ITEMS_LIMIT = 30;
const TRENDING_COUNT_DAYS = 30;

class ContractPurchaseRepository {

    /**
     *
     * @param {Object} purchase
     * @param {String} purchase.request_id
     * @param {String} purchase.access_token
     * @param {String} purchase.address
     * @param {String} purchase.amount
     * @param {String} purchase.status
     * @param {String} purchase.contract_id
     * @param {Function} next
     * @return {*}
     */
    static addPurchase(purchase, next) {
        return ContractPurchase.create(purchase, (err, purchase) => {
            return next(err, purchase);
        });
    }

    /**
     *
     * @param {String} contractId
     * @param {String} request_id
     * @param {Function} next
     */
    static getPaidInfoByRequestId(contractId, request_id, next) {

        return ContractPurchase.findOne({contract_id: contractId, request_id: request_id}, (err, result) => {

            if (err) {
                return next(err);
            }

            if (!result) {
                return next(null, result);
            }

            return next(null, {
                contract_id: result.contract_id,
                request_id: result.request_id,
                amount: result.amount,
                payed_at: result.payed_at,
                created_at: result.created_at,
                from_addresses: result.from_addresses
            });

        });

    }

    /**
     *
     * @param {Array} addresses
     * @param {String} contractId
     * @param {Function} next
     * @return {*}
     */
    static getPaidInfoByAddresses(contractId, addresses, next) {

        return ContractPurchase.findOne({contract_id: contractId, from_addresses: {'$in': addresses}}, (err, result) => {

            if (err) {
                return next(err);
            }

            if (!result) {
                return next('Not Found', 404);
            }

            return next(null, {
                    contract_id: result.contract_id,
                    request_id: result.request_id,
                    amount: result.amount,
                    payed_at: result.payed_at,
                    created_at: result.created_at,
                    from_addresses: result.from_addresses
                }
            );

        });

    }

    /**
     *
     * @param {String} purchaseId
     * @param {String} newStatus
     * @param {Function} next
     * @return {*}
     */
    static updateStatus(purchaseId, newStatus, next) {
        return ContractPurchase.update({_id: purchaseId}, {status: newStatus}, (err, result) => {
            return next(err, result);
        });
    }

    /**
     *
     * @param {String} purchaseId
     * @param {Array} addresses
     * @param {String} payedAt
     * @param {String} newStatus
     * @param {Function} next
     * @return {*}
     */
    static finishPurchase(purchaseId, addresses, payedAt, newStatus, next) {
        return ContractPurchase.findOneAndUpdate({_id: purchaseId}, {from_addresses: addresses, payed_at: payedAt, status: newStatus}, {new: true}, (err, result) => {
            return next(err, result);
        });
    }

    /**
     *
     * @param {Function} next
     * @return {*}
     */
    static fetchTrendingNow(next) {

        let date = new Date();
        date.setDate(date.getDate() - TRENDING_COUNT_DAYS);

        return ContractPurchase.aggregate([{ "$match": { "payed_at": {"$gte": date } } }, {
            $group: {
                _id: "$contract_id",
                total: {
                    "$sum": 1
                }
            }
        }, {
            '$sort': {
                total: -1
            }
        }]).limit(TRENDING_ITEMS_LIMIT).exec((err, results) => {
            return next(err, results);
        });

    }

    /**
     *
     * @param {String} accessToken
     * @param {String} requestId
     * @param {Function} next
     * @return {*}
     */
    static fetchByAccessTokenAndRequestId(accessToken, requestId, next) {
        return ContractPurchase.findOne({access_token: accessToken, request_id: requestId}, (err, result) => {
            return next(err, result);
        });
    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Function} next
     * @return {*}
     */
    static fetchExactlyByAddresses(addresses, next) {
        return ContractPurchase.findOne({from_addresses: {'$all': addresses}}, (err, result) => {
            return next(err, result);
        });
    }

    /**
     *
     * @param {String} purchaseId
     * @param {Number} nonce
     * @param {Function} next
     * @return {*}
     */
    static updateNonceById(purchaseId, nonce, next) {
        return ContractPurchase.findOneAndUpdate({_id: purchaseId}, {nonce: nonce}, {new: true}, (err, result) => {
            return next(err, result);
        });
    }

}

module.exports = ContractPurchaseRepository;