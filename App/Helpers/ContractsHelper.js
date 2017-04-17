const bitcore = require('bitcore-lib');
const OP_CALL = 194;
const OP_CREATE = 193;

class ContractsHelper {

    static isContractVOutHex(str) {

       try {
           let script = bitcore.Script.fromString(str),
               fChunk = script.chunks.find((chunk) => {
                   return (chunk.opcodenum && [OP_CREATE, OP_CALL].indexOf(chunk.opcodenum) !== -1);
               });

           return !!fChunk;
        } catch (e) {
           return false;
        }

    }

}

module.exports = ContractsHelper;