const coreLib = require('qtumcore-lib');

class Address {

    /**
     *
     * @param {String} address - The encoded data
     * @param {String} network - "livenet" or "testnet"
     */
    static isValid(address, network) {
        return coreLib.Address.isValid(address, network);
    }

}

module.exports = Address;