const TokenInterface = require('./ContractData/TokenInterface');
const ContractsInfoService = require('../Services/ContractsInfoService');
const bs58 = require('bs58');

class ContractBalance {

    constructor() {
        this.contractsInfoService = new ContractsInfoService(TokenInterface.interface, TokenInterface.functionHashes);
    }

    getBalance(contractAddress, address, cb) {

        try {

            let hexAddress = new Buffer(bs58.decode(address)).toString('hex'),
                onlyAddress = '0x' + hexAddress.slice(2, -8),
                solidityParam = this.contractsInfoService.createParam('balanceOf', [onlyAddress]);

            return this.contractsInfoService.fetchInfoBySolidityParams(contractAddress, [solidityParam], (err, result) => {
                return cb(err, result);
            });

        } catch (e) {
            return cb(e.message);
        }

    }

}

module.exports = ContractBalance;