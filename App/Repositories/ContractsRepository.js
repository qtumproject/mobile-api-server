const Contract = require('../Models/Contract');
const ContractPurchaseRepository = require('../Repositories/ContractPurchaseRepository');
const LIMIT_LAST_ADDED = 15;

class ContractsRepository {

    /**
     *
     * @param {String} contractId
     * @param {Function} next
     * @return {*}
     */
    static fetchContract(contractId, next) {
        return Contract.findOne({
            _id: contractId
        }, null, (err, contract) => {
            return next(err, contract);
        });
    }

    /**
     *
     * @param {String} contractId
     * @param {Function} next
     * @return {*}
     */
    static fetchPublicContract(contractId, next) {
        return Contract.findOne({
            _id: contractId
        }, [
            '_id',
            'name',
            'description',
            'tags',
            'size',
            'completed_on',
            'with_source_code',
            'publisher_address',
            'type',
            'price',
            'count_buy',
            'count_downloads',
            'created_at'
        ], (err, contract) => {
            return next(err, contract);
        });
    }

    /**
     *
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.offset
     * @param {String} options.type
     * @param {String} options.name
     * @param {Array} options.tags
     * @param {Function} next
     * @return {*}
     */
    static fetchContracts(options, next) {

        let query = {};

        if (options.type) {
            query.type = new RegExp(options.type, 'i');
        }

        if (options.name) {
            query.name = new RegExp(options.name, 'i');
        }

        if (options.tags) {
            query.tags = {'$in': options.tags.map((tag) => {
                return new RegExp(tag, 'i');
            })};
        }

        return Contract.find(query, [
            '_id',
            'name',
            'type',
            'price',
            'count_buy',
            'count_downloads',
            'created_at',
            'tags'
        ], {sort: {created_at: -1}, limit: options.limit, skip: options.offset}, (err, contracts) => {
            return next(err, contracts);
        });
    }

    /**
     *
     * @param {Function} next
     * @return {*}
     */
    static fetchLastAdded(next) {
        return Contract.find({}, [
            '_id',
            'name',
            'type',
            'price',
            'count_buy',
            'count_downloads',
            'created_at'
        ], {sort: {created_at: -1}, limit: LIMIT_LAST_ADDED}, (err, contracts) => {
            return next(err, contracts);
        });
    }

    /**
     *
     * @param {String} contractId
     * @param {Function} next
     * @return {*}
     */
    static fetchAbi(contractId, next) {

        return Contract.findOne({_id: contractId}, [
            '_id',
            'abi'
        ], (err, contract) => {

            if (err) {
                return next(err);
            }

            return next(null, contract ? contract.abi : null);

        });

    }

    /**
     *
     * @param {Function} next
     * @return {*}
     */
    static fetchTrendingNow(next) {

        return ContractPurchaseRepository.fetchTrendingNow((err, results) => {

            if (err) {
                return next(err);
            }

            if (!results || !results.length) {
                return next(null, []);
            }

            let contractIds = [];

            results.forEach((result) => {
                contractIds.push(result._id);
            });

            return Contract.find({
                _id: {
                    $in: contractIds
                }
            }, [
                '_id',
                'name',
                'type',
                'price',
                'count_buy',
                'count_downloads',
                'created_at'
            ], {sort: {count_buy: -1}}, (err, contracts) => {

                if (err) {
                    return next(err);
                }

                return next(null, contracts);

            });

        });

    }

    /**
     *
     * @param {String} contractId
     * @param {Function} next
     * @return {*}
     */
    static incrementCountBuy(contractId, next) {
        return Contract.update({
            _id: contractId
        }, { $inc: { count_buy: 1} }, (err,r) => {
            console.log(err, r);
                return next(err);
            }
        );
    }

    /**
     *
     * @param {String} contractId
     * @param {Function} next
     * @return {*}
     */
    static incrementCountDownloads(contractId, next) {
        return Contract.update({
                _id: contractId
            }, { $inc: { count_downloads: 1} }, (err) => {
                return next(err);
            }
        );
    }

    /**
     *
     * @param {Object} data
     * @param next
     * @return {data}
     */
    static createContract(data, next) {
        return Contract.create(data, (err, contract) => {
            return next(err, contract);
        });
    }

    /**
     *
     * @param {Function} next
     */
    static fetchTypes(next) {
        return Contract.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            },
            {
                "$project": {
                    type: "$_id",
                    count: 1
                }
            }
        ]).exec((err, results) => {
            return next(err, results);
        });
    }

}

module.exports = ContractsRepository;