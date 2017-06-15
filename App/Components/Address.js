const coreLib = require('bitcore-lib');

class Address {

    static isValid(address, network) {
        return coreLib.Address.isValid(address, network);
    }

}

module.exports = Address;