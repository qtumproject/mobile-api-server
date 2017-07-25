const request = require('request');
const crypto = require('crypto');
const r = require('jsrsasign');
const config = require('../../config/main.json');

let KJUR = r.KJUR;
let privateKey = KJUR.asn1.ASN1Util.getPEMStringFromHex(config.RECEIVE_API.PRIVATE_KEY, 'PRIVATE KEY');

class ReceiveApiRepository {

    /**
     *
     * @param {String} finalTransferAddress
     * @param {String} amount
     * @param {Function} next
     * @returns {*}
     */
    static createNewReceiveTransaction(finalTransferAddress, amount, next) {

        let sign = crypto.createSign('RSA-SHA256'),
            data = {
                "public_key": config.RECEIVE_API.PUBLIC_KEY,
                "datetime": new Date().toISOString(),
                "amount": amount,
                "final_transfer_address": finalTransferAddress
            },
            signature;

        data = new Buffer(JSON.stringify(data)).toString('base64');

        sign.update(data);

        signature = sign.sign(privateKey, 'hex');

        return request.post({
            url: config.RECEIVE_API.URL + '/api/v1/transactions',
            form:  {
                "payload": data,
                "header": {
                    "signature": signature // signature of "Base64String" String
                }
            },
            json: true
        }, (error, response, body) => {

            if (error) {
                return next(error);
            }

            if (!body) {
                return next('Receive server error');
            }

            return next(error, body);
        });

    }


    static fetchTransactionById(transactionId, next) {
        return request.get({
            url: config.RECEIVE_API.URL + `/api/v1/transactions/${transactionId}`,
            json: true
        }, (error, response, body) => {

            if (error) {
                return next(error);
            }

            if (!body) {
                return next('Receive server error');
            }

            return next(error, body);
        });
    }

}

module.exports = ReceiveApiRepository;