let request = require('request'),
    _ = require('lodash'),
    config = require('../../config/main.json');

class InsightApiRepository {

    /**
     *
     * @param {Function} cb
     * @returns {*}
     */
    static getInfo(cb) {
        return request.get({
            url: config.INSIGHT_API_URL + '/status?q=getInfo',
            json: true
        }, (error, response, body) => {
                return cb(error, body);
            });
    }

    /**
     *
     * @param {String} txid
     * @param {Function} cb
     * @returns {*}
     */
    static getTrx(txid, cb) {
        return request.get({
            url: config.INSIGHT_API_URL + `/tx/${txid}`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                body = null;
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {String} rawtx
     * @param {Boolean} allowAbsurdFees
     * @param {Function} cb
     * @returns {*}
     */
    static sendRawTransaction(rawtx, allowAbsurdFees, cb) {
        return request.post({
                url: config.INSIGHT_API_URL + '/tx/send',
                form: {
                    rawtx: rawtx,
                    allowAbsurdFees: allowAbsurdFees
                }
            }, (error, response, body) => {

                try {

                    let json = JSON.parse(body);

                    if (_.isObject(json)) {
                        return cb(null, json)
                    } else {
                        return cb(body);
                    }

                } catch (e) {

                    return cb(body);
                }

            });

    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Function} cb
     * @returns {*}
     */
    static getUnspentAddresses(addresses, cb) {
        return request.get({
            url: config.INSIGHT_API_URL + `/addrs/${addresses.join(',')}/utxo`,
            json: true
        }, (error, response, body) => {
               return cb(error, body);
            });
    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Object} options
     * @param {Number} options.from
     * @param {Number} options.to
     * @param {Function} cb
     * @returns {*}
     */
    static getAddressesHistory(addresses, options, cb) {
        return request.get({
            url: config.INSIGHT_API_URL + `/addrs/${addresses.join(',')}/txs?from=${options.from}&to=${options.to}`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                body = null;
            }

            return cb(error, body);
        });
    }

    /**
     *
     * @param {Array.<String>} addresses
     * @param {Function} cb
     * @returns {*}
     */
    static getAddressesBalance(addresses, cb) {
        console.log('addresses', addresses);
        return request.get({
            url: config.INSIGHT_API_URL + `/addrs/${addresses.join(',')}/balance`,
            json: true
        }, (error, response, body) => {
            console.log('response', response.statusCode);
            return cb(error, body);
        });
    }

    /**
     *
     * @param {String} address
     * @param {String} hash
     * @param {Function} cb
     * @returns {*}
     */
    static callContract(address, hash, cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/contracts/${address}/hash/${hash}/call`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                return cb(body);
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {Number} nBlocks
     * @param {Function} cb
     * @returns {*}
     */
    static minEstimateFee(nBlocks, cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/utils/minestimatefee?nBlocks=${nBlocks}`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                return cb(body);
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {String} address
     * @param {Function} cb
     * @returns {*}
     */
    static getAccountInfo(address, cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/contracts/${address}/info`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                body = null;
            }

            return cb(error, body);

        });
    }

}

module.exports = InsightApiRepository;