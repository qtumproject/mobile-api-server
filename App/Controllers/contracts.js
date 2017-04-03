let ContractsGenerator = require("../Services/ContractsGenerator"),
    logger = require('log4js').getLogger('Contracts Controller');

let Controllers = getControllers();

class ContractsController {

    constructor() {
        logger.info('Init');
    }

    generateTokenBytecode(cb, data) {

        try {

            let tokens = ContractsGenerator.generateToken({
                initialSupply: data._post.initialSupply,
                tokenName: data._post.tokenName,
                decimalUnits: data._post.decimalUnits,
                tokenSymbol: data._post.tokenSymbol
            });

            cb(null, tokens);

        } catch (e) {
            cb(e.message, null);
        }

    }
}

Controllers.contracts = new ContractsController();