const TokenInterface = require('./ContractData/TokenInterface');
const ContractsInfoService = require('../Services/ContractsInfoService');
const bs58 = require('bs58');

class TokenContract {

    constructor() {
        this.contractsInfoService = new ContractsInfoService(TokenInterface.interface, TokenInterface.functionHashes);
    }

    /**
     *
     * @param {String} contractAddress
     * @param {String} address
     * @param {Function} next
     * @returns {*}
     */
    getBalance(contractAddress, address, next) {

        try {

            let hexAddress = new Buffer(bs58.decode(address)).toString('hex'),
                onlyAddress = '0x' + hexAddress.slice(2, -8),
                solidityParam = this.contractsInfoService.createParam('balanceOf', [onlyAddress]);

            return this.contractsInfoService.fetchInfoBySolidityParams(contractAddress, [solidityParam], (err, result) => {
                return next(err, result);
            });

        } catch (e) {
            return next(e.message);
        }

    }

    /**
     *
     * @param {String} contractAddress
     * @param {Function} next
     * @return {*}
     */
    getDecimals(contractAddress, next) {

        try {

            let solidityParams = [this.contractsInfoService.createParam('decimals')];

            return this.contractsInfoService.fetchInfoBySolidityParams(contractAddress, solidityParams, (err, result) => {
                return next(err, result);
            });

        } catch (e) {
            return next(null, {decimals: 0});
        }

    }

}

module.exports = TokenContract;