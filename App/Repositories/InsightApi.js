let request = require('request'),
    _ = require('lodash'),
    config = require('../../config/main.json');

class InsightApi {

    static getInfo(cb) {
        return request.get({
            url: config.INSIGHT_API_URL + '/status?q=getInfo',
            json: true
        }, (error, response, body) => {
                cb(error, body);
            });
    }

    static getTrx(txid, cb) {
        return request.get({
            url: config.INSIGHT_API_URL + `/tx/${txid}`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                body = null;
            }

            cb(error, body);

        });
    }

    static sendRawTransaction(rawtx, allowAbsurdFees, cb) {
        return request.post({
                url: config.INSIGHT_API_URL + '/tx/send',
                form: {
                    rawtx: rawtx,
                    allowAbsurdFees: allowAbsurdFees
                }
            }, (error, response, body) => {
                cb(error, body);
            });

    }

    static getUnspentAddresses(addresses, cb) {
        return request.get({
            url: config.INSIGHT_API_URL + `/addrs/${addresses.join(',')}/utxo`,
            json: true
        }, (error, response, body) => {
                cb(error, body);
            });
    }

    static getAddressesHistory(addresses, options, cb) {
        return request.get({
            url: config.INSIGHT_API_URL + `/addrs/${addresses.join(',')}/txs?from=${options.from}&to=${options.to}`,
            json: true
        }, (error, response, body) => {
            cb(error, body);
        });
    }

    static getAddressesBalance(addresses, cb) {
        return request.get({
            url: config.INSIGHT_API_URL + `/addrs/${addresses.join(',')}/balance`,
            json: true
        }, (error, response, body) => {
            cb(error, body);
        });
    }

    static callContract(address, hash, cb) {

        return request.get({
            url: config.INSIGHT_API_URL + `/contracts/${address}/hash/${hash}/call`,
            json: true
        }, (error, response, body) => {

            if (body && _.isString(body)) { //Fix "Not Found" api response
                body = null;
            }

            cb(error, body);

        });
    }
}

module.exports = InsightApi;