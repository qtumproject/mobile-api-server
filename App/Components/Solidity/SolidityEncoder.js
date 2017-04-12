const coder = require('../../../node_modules/web3/lib/solidity/coder');

class SolidityEncoder {

    constructor(json) {
        this._outputTypes = json.outputs.map((i) => {
            return i.type;
        });
    }

    unpackOutput(output) {
        if (!output) {
            return;
        }
        let result = coder.decodeParams(this._outputTypes, output);
        return result.length === 1 ? result[0] : result;
    }

}

module.exports = SolidityEncoder;