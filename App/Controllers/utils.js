let bs58 = require('bs58');
let Controllers = getControllers();

class UtilsController {
	
	constructor() {}
	
	decodeAddress(addr) {
		let bytes = bs58.decode(addr);
		while(bytes.length < 25) {
			bytes = Buffer.concat([new Buffer('\0'), bytes]);
		}
		return bytes.slice(1, 21);
	}
}



Controllers.utils = new UtilsController();