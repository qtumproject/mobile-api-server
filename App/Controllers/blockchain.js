let quantum = require('bitcoin'),
	logger = require('log4js').getLogger('Blockchain Controller'),
	async = require('async'),
	bs58 = require('bs58'),
	config = require(ConfigPath);

let Controllers = getControllers();
let Models = getModels();

class BlockchainController {
	constructor() {
		this.client = new quantum.Client(config.blockchain);
		this.client.getInfo((err, result) => {
			if(err) {
				return logger.error('Blockchain connection error');
			}
			logger.info('Blockchain has been connected', result);
		});
		
		this.sendRawTransaction = this.sendRawTransaction.bind(this);
		this.getInfo = this.getInfo.bind(this);
	}
	
	run() {
		// let testAddress = '1LsLpGVYKSwrvHwqPpzvth18Wk8i5pyca2';
	}
	
	sendRawTransaction(cb, data) {
		logger.info('sendRawTransaction');
		logger.info(data._post);
		let transaction = data._post.data;
		let allowHighFee = parseInt(data._post.allowHighFees) == 1;
		this.client.sendRawTransaction(transaction, allowHighFee, (err, result) => {
			if(err) {
				return cb(err.message);
			}
			cb(null, result);
		});
	}
	
	getInfo(cb) {
		this.client.getInfo(cb);
	}
}

Controllers.blockchain = new BlockchainController();

