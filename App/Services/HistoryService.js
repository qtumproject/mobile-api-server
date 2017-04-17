let BigNumber = require('bignumber.js');
let ContractsHelper = require('../Helpers/ContractsHelper');

class HistoryService {

    static formatHistory(history) {

        let items = [];

        if (!history) {
            return {
                totalItems: 0,
                items: []
            }
        }

        if (history && history.items && history.items.length) {
            history.items.forEach((item) => {
                items.push(HistoryService.formatHistoryItem(item));
            });
        }

        return {
            totalItems: history && history.totalItems ? history.totalItems : 0,
            items: items
        };
    }

    static formatHistoryItem(item) {
        let vout = [],
            vin = [],
            contract_has_been_created = false;

        if (item.vin) {
            item.vin.forEach((vIn) => {

                let num = new BigNumber(vIn.value);

                vin.push({
                    value: num.toString(10),
                    address: vIn.addr
                });

            });
        }

        if (item.vout) {

            item.vout.forEach((vOut) => {

                if (vOut.scriptPubKey) {

                    if (ContractsHelper.isContractVOutHex(vOut.scriptPubKey.hex)) {
                        contract_has_been_created = true;
                    }

                    if (vOut.scriptPubKey.addresses) {

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

        if (contract_has_been_created) {
            result.contract_has_been_created = true;
        }

        return result;
    }
}

module.exports = HistoryService;