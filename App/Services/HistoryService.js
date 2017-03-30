
class HistoryService {

    static formatHistory(history) {
        var items = [];

        if (history && history.items && history.items.length) {
            history.items.forEach(function (item) {
                items.push(HistoryService.formatHistoryItem(item));
            });
        }

        return items;
    }

    static formatHistoryItem(item) {
        var vout = [],
            vin = [];

        item.vin.forEach(function (vIn) {

            vin.push({
                value: vIn.value,
                address: vIn.addr
            });

        });

        item.vout.forEach(function (vOut) {

            if (vOut.scriptPubKey && vOut.scriptPubKey.addresses) {

                vout.push({
                    value: vOut.value,
                    address: vOut.scriptPubKey.addresses[0] ? vOut.scriptPubKey.addresses[0] : null
                });
            }


        });

        return {
            block_time: item.blocktime ? item.blocktime : null,
            block_height: item.blockheight ? item.blockheight : null,
            block_hash: item.blockhash ? item.blockhash : null,
            tx_hash: item.txid,
            amount: item.valueIn,
            vout: vout,
            vin: vin
        }
    }
}

module.exports = HistoryService;
