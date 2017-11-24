const request = require('request');
const _ = require('lodash');
const config = require('../../config/main.json');
const queryString = require('query-string');

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
        return request.get({
            url: config.INSIGHT_API_URL + `/addrs/${addresses.join(',')}/balance`,
            json: true
        }, (error, response, body) => {
            return cb(error, body);
        });
    }

    /**
     *
     * @param {String} address
     * @param {String} hash
     * @param {String} from
     * @param {Function} cb
     * @returns {*}
     */
    static callContract(address, hash, from, cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/contracts/${address}/hash/${hash}/call` + (from ? ('?from=' + from) : ''),
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

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error minEstimateFee: ', body);
                return cb('Not Found')
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

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) { //Fix "Not Found" api response
               body = null;
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {Function} cb
     * @returns {*}
     */
    static getDgpinfo(cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/dgpinfo`,
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error getDgpinfo: ', body);
                return cb('Not Found')
            }

            return cb(error, body);

        });
    }

    /**
     *
     * @param {String} txHash
     * @param {Function} cb
     * @returns {*}
     */
    static getTransactionReceipt(txHash, cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/txs/${txHash}/receipt`,
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error getTransactionReceipt: ', body);
                return cb('Not Found')
            }

            return cb(error, body);

        });
    }

    static fetchQrc20Transfers(contractAddress, options, cb) {

        let queryParamsString = queryString.stringify(options, {arrayFormat: 'bracket'});

        return request.get({
            url: config.INSIGHT_API_URL + `/erc20/${contractAddress}/transfers` + (queryParamsString ? ('?' + queryParamsString) : ''),
            json: true
        }, (error, response, body) => {

            if (error) {
                return cb(error, body);
            }

            if (body && _.isString(body)) {
                console.log('Error fetchQrc20Transfers: ', body);
                return cb('Not Found')
            }

            return cb(error, body);

        });
    }


}

module.exports = InsightApiRepository;