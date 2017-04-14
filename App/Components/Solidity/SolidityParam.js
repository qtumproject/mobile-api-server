class SolidityParam {

    constructor(paramName, paramDataArray, hash, type) {
        this.paramName = paramName;
        this.paramDataArray = paramDataArray;
        this.hash = hash;
        this.type = type;
    }

}

module.exports = SolidityParam;