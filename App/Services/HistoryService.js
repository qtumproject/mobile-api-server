let BigNumber = require('bignumber.js');
let ContractsHelper = require('../Helpers/ContractsHelper');
let InsightApiRepository = require('../Repositories/InsightApiRepository');
let async = require('async');

class HistoryService {

    /**
     *
     * @param {Object} history
     * @param {Array.<Object>} history.items
     * @param {Number} history.totalItems
     * @param next
     * @returns {*}
     */
    static formatHistory(history, next) {

        if (!history || !history.items || !history.items.length) {
            return next(null, {
                totalItems: 0,
                items: []
            });
        }

        let items = new Array(history.items.length);

        return async.each(history.items, (item, callback) => {

            let idx = history.items.indexOf(item);

            return HistoryService.formatHistoryItem(item, (err, result) => {

                items[idx] = result;

                return callback();
            });

        }, (err) => {
            return next(err, {
                totalItems: history && history.totalItems ? history.totalItems : 0,
                items: items
            });
        });


    }

    /**
     *
     * @param {Object} item
     * @param {Function} cb
     * @returns {*}
     */
    static formatHistoryItem(item, cb) {
        let vout = [],
            vin = [],
            addressCallString = null,
            addressCreateString = null;

        if (item.vin) {
            item.vin.forEach((vIn) => {

                if (vIn.addr) {

                    let num = new BigNumber(vIn.value);

                    vin.push({
                        value: num.toString(10),
                        address: vIn.addr
                    });

                }

            });
        }

        if (item.vout) {

            item.vout.forEach((vOut) => {

                if (vOut.scriptPubKey) {

                    try {
                        if (ContractsHelper.isContractCreateVOutHex(vOut.scriptPubKey.hex)) {
                            addressCreateString = ContractsHelper.getContractAddress(item.txid, vOut.n);
                        }
                    } catch (e) {}

                    try {
                        if (!addressCreateString && ContractsHelper.isContractCallVOutHex(vOut.scriptPubKey.hex)) {
                            addressCallString = ContractsHelper.getCallContractAddressFromVOutHex(vOut.scriptPubKey.hex);
                        }
                    } catch (e) {}

                    if (vOut.scriptPubKey.addresses && vOut.scriptPubKey.addresses.length && typeof vOut.value !== 'undefined') {

                        let num = new BigNumber(vOut.value);

                        vout.push({
                            value: num.toString(10),
                            address: vOut.scriptPubKey.addresses[0] ? vOut.scriptPubKey.addresses[0] : null
                        });

                    }

                }

            });

        }

        let result = {
            block_time: item.blocktime ? item.blocktime : null,
            block_height: item.blockheight ? item.blockheight : -1,
            block_hash: item.blockhash ? item.blockhash : null,
            tx_hash: item.txid,
            amount: item.valueIn,
            vout: vout,
            vin: vin
        };

        if (!addressCreateString && !addressCallString) {
            return cb(null, result);
        }

        return InsightApiRepository.getAccountInfo(addressCreateString ? addressCreateString : addressCallString, (err, res) => {

            if (err) {
                return cb(err)
            }

            if (res && addressCreateString) {
                result.contract_has_been_created = true;
            }

            if (!res && addressCallString) {
                result.contract_has_been_deleted = true;
            }

            return cb(null, result);

        });

    }

}

module.exports = HistoryService;