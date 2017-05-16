let solc = require('solc'),
    Mustache = require('mustache'),
    fs = require('fs'),
    CONTRACT_NAME = 'MyToken',
    MyTokenTemplate = fs.readFileSync( __dirname + '/../Components/ContractTemplates/' + CONTRACT_NAME + '.solc.tpl', "utf8");

class ContractsGenerator {


    static encodeContract(contract) {
        let output = solc.compile(contract);

        return output;
    }

    static generateToken(data) {

        let input = Mustache.render(MyTokenTemplate, {
                initialSupply: data.initialSupply,
                tokenName: data.tokenName,
                decimalUnits: data.decimalUnits,
                tokenSymbol: data.tokenSymbol
            }),
            output = solc.compile(input, 1);

        if (output.errors || !output.contracts || !output.contracts[':' + CONTRACT_NAME]) {
            throw new Error("Error generate " + CONTRACT_NAME);
        } else {

            return {
                bytecode: output.contracts[':' + CONTRACT_NAME]['bytecode']
                // t: output.contracts[':' + CONTRACT_NAME]
            }

        }
    }

}

module.exports = ContractsGenerator;