const SolidityParam = require('./SolidityParam');
const SolidityCoder = require('./SolidityCoder');

class SolidityParamCreator {

    constructor(solidityInterface, functionHashes) {
        this.solidityInterface = solidityInterface;
        this.functionHashes = functionHashes;
        this.findedFields = {};
    }

    createParam(paramName, paramDataArray) {
        return new SolidityParam(paramName, paramDataArray, this.getHash(paramName, paramDataArray), this.getType(paramName));
    }

    getType(paramName) {

        if (!this.findedFields[paramName]) {
            this.findedFields[paramName] = this.findFieldInInterface(paramName);
        }

        let field = this.findedFields[paramName];

        if (!field) {
            throw new Error('Wrong interface or param name');
        }

        return field['outputs'][0]['type'];

    }

    getHash(paramName, paramDataArray) {

        let functionHashesKeys = Object.keys(this.functionHashes),
            hashKey = functionHashesKeys.find((hash) => {
                return hash.replace(/\(.*\)/,'') === paramName;
            }),
            signature = this.functionHashes[hashKey],
            payload = '';

        if (paramDataArray && paramDataArray.length) {

            if (!this.findedFields[paramName]) {
                this.findedFields[paramName] = this.findFieldInInterface(paramName);
            }

            let field = this.findedFields[paramName],
                solidityCoder = new SolidityCoder(field);

            payload = solidityCoder.encodeInputs(paramDataArray);

        }

        return signature + payload;

    }

    findFieldInInterface(fieldName) {
        return this.solidityInterface.find((itemInterface) => {
            return itemInterface.name === fieldName;
        });
    }

}

module.exports = SolidityParamCreator;