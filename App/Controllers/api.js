"use strict";

let async = require('async'),
	logger = require('log4js').getLogger('API Controller'),
	moment = require('moment'),
	express = require('express'),
	extend = require('extend'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	crypto = require('crypto'),
	cors = require('cors'),
	multer = require('multer'),
	fs = require('fs'),
	path = require('path'),
	config = require('../../config/main.json');

let Controllers = getControllers();

let APIController = {
	app: {},
	io: null,
	init: function(port) {
		this.runServer(port);

		let corsOptions = {
			origin: function(origin, callback) {
				callback(null, true);
			},
			credentials: true,
			methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
			headers: ['x-user', 'X-Signature', 'accept', 'content-type']
		};
		APIController.app.use(morgan('combined'));
		APIController.app.use(cors(corsOptions));
		APIController.app.use(bodyParser.urlencoded({extended: true}));
		APIController.app.use(bodyParser.json());
		APIController.app.options('*', cors());


        APIController.addHandler('get', '/qrc20/:contractAddress/transfers', Controllers.qrc20.fetchTransfers.bind(Controllers.qrc20));

        APIController.addHandler('get', '/contracts/:contractAddress/exists', Controllers.contracts.exists.bind(Controllers.contracts));

        APIController.addHandler('get', '/contracts/types', Controllers.contracts.fetchContractTypes.bind(Controllers.contracts));

		APIController.addHandler('post', '/contracts/encoder', Controllers.contracts.encodeContract);
        APIController.addHandler('post', '/contracts/:contractAddress/call', Controllers.contracts.fetchEncodedParams);

        APIController.addHandler('post', '/contracts/generate-token-bytecode', Controllers.contracts.generateTokenBytecode);
        APIController.addHandler('get', '/contracts/:contractAddress/params', Controllers.contracts.fetchContractParams);

        APIController.addHandler('get', '/estimate-fee-per-kb', Controllers.blockchain.getFeePerKb);



        APIController.addHandler('post', '/contracts/:contractId/source-code', Controllers.contractsStore.getSourceCode.bind(Controllers.contractsStore));
        APIController.addHandler('post', '/contracts/:contractId/bytecode', Controllers.contractsStore.getBytecode.bind(Controllers.contractsStore));
        APIController.addHandler('get', '/contracts/trending-now', Controllers.contractsStore.fetchTrendingNow.bind(Controllers.contractsStore));
        APIController.addHandler('post', '/contracts/:contractId/buy-request', Controllers.contractsStore.buyContract.bind(Controllers.contractsStore));
        APIController.addHandler('get', '/contracts/:contractId/is-paid/by-request-id', Controllers.contractsStore.getPaidInfoByRequestId.bind(Controllers.contractsStore));
        APIController.addHandler('get', '/contracts/:contractId/is-paid/by-address', Controllers.contractsStore.getPaidInfoByAddresses.bind(Controllers.contractsStore));
        APIController.addHandler('get', '/contracts/:contractId/abi', Controllers.contractsStore.fetchAbi.bind(Controllers.contractsStore));
        APIController.addHandler('get', '/contracts/last-added', Controllers.contractsStore.fetchLastAdded.bind(Controllers.contractsStore));
        APIController.addHandler('get', '/contracts/:limit/:offset', Controllers.contractsStore.fetchContracts.bind(Controllers.contractsStore));
        APIController.addHandler('get', '/contracts/:contractId', Controllers.contractsStore.fetchContract.bind(Controllers.contractsStore));

        APIController.addHandler('post', '/send-raw-transaction', Controllers.transactions.sendRawTransaction);

        APIController.addHandler('get', '/history/:limit/:offset', Controllers.history.getAddressHistoryList.bind(Controllers.history));
        APIController.addHandler('get', '/history/:address/:limit/:offset', Controllers.history.getAddressHistory.bind(Controllers.history));

		APIController.addHandler('get', '/transactions/:txhash/receipt', Controllers.transactions.getTransactionReceipt.bind(Controllers.transactions));
		APIController.addHandler('get', '/transactions/:txhash', Controllers.transactions.getTransaction.bind(Controllers.transactions));

		APIController.addHandler('get', '/outputs/unspent/:address', Controllers.outputs.getUnspentByAddress.bind(Controllers.outputs));
		APIController.addHandler('get', '/outputs/unspent', Controllers.outputs.getUnspentByAddresses.bind(Controllers.outputs));

		APIController.addHandler('get', '/news/:lang', Controllers.news.getNews);

		APIController.addHandler('get', '/blockchain/info', Controllers.blockchain.getInfo);
        APIController.addHandler('get', '/blockchain/dgpinfo', Controllers.blockchain.fetchDgpInfo.bind(Controllers.blockchain));

		if (config.ENVIRONMENT === 'DEV') {

            APIController.app.get('/test', (req, res) => {
                res.sendFile(path.resolve('App/Views/index.html'));
            });

            APIController.app.get('/insight', (req, res) => {
                res.sendFile(path.resolve('App/Views/insight.html'));
            });

		}


	},
	server: null,
	getServer: () => {
		return APIController.server;
	},
	runServer: (port) => {
		let express = require('express');
		APIController.app = express();
		APIController.server = require('http').Server(APIController.app);
		APIController.server.listen(port, '0.0.0.0');
		logger.info('API APP REST listen ' + port + ' Port');
	},
	/**
	 * Register new route.
	 */
	addHandler: (type, route, action) => {
		APIController.app[type](route, (req, res) => {
			async.waterfall([
				// run method
				(cb) => {
					action(cb, {
						_post: req.body,
						_get: extend({}, req.query, req.params),
						req: req,
						res: res,
						user: req.user
					});
				}
			], (err, result) => {
				res.header('Content-Type', 'text/json');
				if(err) {
					if(typeof err == 'string') {
						err = {
							message: err
						};
					}
					return res.status((result && !isNaN(parseInt(result))) ? result : 400).end(JSON.stringify(err));
				}
				if(typeof result != 'object') {
					result = {
						result: result
					};
				}
				return res.send(result);
			});
		});
	}
};

Controllers.api = APIController;