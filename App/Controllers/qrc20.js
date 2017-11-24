const logger = require('log4js').getLogger('Qrc20Controller Controller');
const _ = require('lodash');
const InsightApiRepository = require("../Repositories/InsightApiRepository");

let Controllers = getControllers();

class Qrc20Controller {

    constructor() {
        logger.info('Init');
    }

    /**
     *
     * @param {Function} cb
     * @param {Object} data
     * @param {Object} data.req
     * @param {Object} data.req.query
     * @param {Number} data.req.query.offset
     * @param {Number} data.req.query.limit
     * @param {Array} data.req.query.addresses
     * @param {Object} data.req.params
     * @param {String} data.req.params.contractAddress
     * @return {*}
     */
    fetchTransfers(cb, data) {

        let req = data.req,
            contractAddress = req.params.contractAddress,
            offset = req.query.offset,
            limit = req.query.limit,
            addresses = req.query.addresses;


        if (!_.isArray(addresses) || !_.isString(contractAddress) || !contractAddress.trim()) {
            return cb("Bad Request", 400);
        }

        return InsightApiRepository.fetchQrc20Transfers(contractAddress, {
            offset: offset,
            limit: limit,
            addresses: addresses
        }, (err, data) => {

            if (err) {
                return cb("Not Found", 404);
            }

            if (data && data.items && data.items.length) {

                data.items = data.items.map((item) => {
                    return {
                        from: item.from,
                        to: item.to,
                        amount: item.value,
                        tx_hash: item.tx_hash,
                        tx_time: item.tx_time,
                        contract_address: item.contract_address
                    };
                });

            }

            return cb(null, data);

        });

    }

}

Controllers.qrc20 = new Qrc20Controller();