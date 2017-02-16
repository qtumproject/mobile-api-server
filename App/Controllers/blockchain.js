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
		
		setTimeout(() => {
			this.client.sendRawTransaction("01000000026711139820c32c67cd3b1f2d77c59163045cfb1c83da078a407bb8018799b144000000006b483045022100f4c1f2e1fa26f973498eaa99ef389968334f025e4770fd6dccc0ca0340d3f24a0220439a9718a41c1fe203b09dc86d28c4b2702b4c17def053ace1082155e8b19c3e81210395adf68f0e6f4b515a0137da73145cf3f278a4835004ee839b0d3cc93a210e08fffffffffc45201cc34bed1ed86dbc0c2abbb8347adcc33537e7cfad4d8d6f6cd8109055000000006a4730440220174c695d85e955335a6394fd956d295517fe35e7d0ea8fe0be964d019c4f7bda0220527b6cd44a426a0c4d473cc7f7e60f38195f300f7c69c37658e6a9d3ba6de17f81210395adf68f0e6f4b515a0137da73145cf3f278a4835004ee839b0d3cc93a210e08ffffffff02100b0c54020000001976a9147dd9635b0f5c99dd822bb8385eb280cf58d9ca9888acf0bc0b54020000001976a914f0eba49a7dff59d61a8b80b69aa1faf4d8a8141588ac0000000058a58e17", (err, result) => {
				logger.info(err);
				logger.info(result);
			});
		});
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

