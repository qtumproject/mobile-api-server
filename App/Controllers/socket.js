let InsightApiRepository = require("../Repositories/InsightApiRepository"),
    HistoryService = require("../Services/HistoryService"),
    MobileContractBalanceNotifier = require("../Components/MobileContractBalanceNotifier"),
    MobileAddressBalanceNotifier = require("../Components/MobileAddressBalanceNotifier"),
    logger = require('log4js').getLogger('Socket Controller'),
    config = require('../../config/main.json'),
    socketIO = require('socket.io'),
    socketIOClient = require('socket.io-client');

const Address = require('../Components/Address');
const _ = require('lodash');
const TokenBalanceChangeEvents = require('../Components/SocketEvents/TokenBalanceChangeEvents');
const QtumRoomEvents = require('../Components/SocketEvents/QtumRoomEvents');
const TokenContract = require('../Components/TokenContract');
const ContractPurchaseEvents = require('../Components/SocketEvents/ContractPurchaseEvents');
const contractPurchaseWatcherInstance = require("../Components/ContractPurchaseWatcherInstance");

let Controllers = getControllers();

class SocketController {

    constructor() {
        logger.info('Init');
        this.socket = null;
        this.socketClient = null;
        this.events = {};
    }

    init(server) {

        this.tokenContract = new TokenContract();
        this.mobileContractBalanceNotifier = new MobileContractBalanceNotifier(this.tokenContract);


        this.initSocket(server);
        this.initRemoteSocket(config.INSIGHT_API_SOCKET_SERVER);
        this.initSocketEvents();

        this.mobileAddressBalanceNotifier = new MobileAddressBalanceNotifier(this.socketClient);

    }

    initSocket(server) {
        this.socket = socketIO.listen(server);
        this.socket.on('connection', this.socketHandler.bind(this));
    }

    initRemoteSocket(SOCKET_SERVER) {
        this.socketClient = socketIOClient(SOCKET_SERVER);
    }

    initSocketEvents() {
        this.events.tokenBalanceEvents = new TokenBalanceChangeEvents(this.socket, this.tokenContract);
        this.events.qtumRoomEvents = new QtumRoomEvents(this.socket, this.socketClient);
        this.events.contractPurchaseEvents = new ContractPurchaseEvents(contractPurchaseWatcherInstance);
    }

    /**
     * @param {Object} socket - Socket emitter
     *
     */
    socketHandler(socket) {

        let remoteAddress = this._getRemoteAddress(socket);

        logger.info('a user connected', remoteAddress);

        socket.on('subscribe', (name, payload, options) => {

            logger.info(remoteAddress, 'Web socket subscribe:', name, payload, options);

            switch (name) {
                case 'balance_subscribe':

                    this.subscribe_balance_change(socket, payload, this.getMergedBaseConfig(options));

                    break;
                case 'token_balance_change':

                    this.subscribe_token_balance_change(socket, payload, this.getMergedBaseConfig(options));

                    break;
                case 'contract_purchase':

                    this.subscribe_contract_purchase(socket, payload);

                    break;
            }

        });

        socket.on('unsubscribe', (name, payload, options) => {

            logger.info(remoteAddress, 'Web socket unsubscribe:', name);

            switch (name) {
                case 'balance_subscribe':

                    this.unsubscribe_balance(socket, payload, this.getMergedBaseConfig(options));

                    break;

                case 'token_balance_change':

                    this.unsubscribe_token_balance(socket, payload, this.getMergedBaseConfig(options));

                    break;
                case 'contract_purchase':

                    this.unsubscribe_contract_purchase(socket, payload);

                    break;
            }

        });

        socket.on('disconnect', () => {

            this.events.qtumRoomEvents.unsubscribeAddress(socket, null);
            this.events.tokenBalanceEvents.unsubscribeAddress(socket, null);

            logger.info('User disconnected', remoteAddress);

        });

    }

    /**
     *
     * @param options
     * @returns {{notificationToken: String|null, prevToken: String|null, language: String}}
     */
    getMergedBaseConfig(options) {

        if (!options) {
            options = {};
        }

        let language = 'en';

        if (['es', 'en', 'cn', 'de'].indexOf(options.language) !== -1) {
            language = options.language;
        }

        return {
            notificationToken: options.notificationToken || null,
            prevToken: options.prevToken || null,
            language: language
        };
    }

    /**
     * @param {Object} socket - Socket emitter
     * @param {Array} addresses
     * @param {Object} options
     * @returns {boolean}
     */
    subscribe_balance_change(socket, addresses, options) {

        if (!this.addressesIsValid(addresses)) {
            return false;
        }

        this.events.qtumRoomEvents.subscribeAddress(socket, addresses);

        if (options.notificationToken) {
            this.mobileAddressBalanceNotifier.subscribeAddress(addresses, options);
        }

    }

    /**
     * @param {Object} socket - Socket emitter
     * @param {Object} payload
     * @param {Object} options
     * @returns {boolean}
     */
    subscribe_token_balance_change(socket, payload, options) {

        if (!_.isObject(payload) || !payload.contract_address || !_.isString(payload.contract_address) || !payload.addresses) {
            return false;
        }

        let addresses = payload.addresses,
            contractAddress = payload.contract_address;

        if (!this.addressesIsValid(addresses)) {
            return false;
        }

        return InsightApiRepository.getAccountInfo(contractAddress, (err, res) => {

            if (err || !res) {
                logger.error('Bad contract address', contractAddress, err, res);
                return false;
            }

            contractAddress = contractAddress.toLowerCase();
            payload.contract_address = payload.contract_address.toLowerCase();

            this.events.tokenBalanceEvents.subscribeAddress(socket, payload);

            if (options.notificationToken && addresses.length) {
                this.mobileContractBalanceNotifier.subscribeMobileTokenBalance(contractAddress, addresses, options);
            }

        });

    }

    /**
     *
     * @param {Object} socket - Socket emitter
     * @param {String} requestId
     */
    subscribe_contract_purchase(socket, requestId) {

        if (!requestId || !_.isString(requestId) || !requestId.trim()) {
            return false;
        }

        this.events.contractPurchaseEvents.subscribe(socket, requestId);

    }

    /**
     * @param {Object} socket - Socket emitter
     * @param {Array|null} addresses
     * @param {Object|null} options
     * @param {String} options.notificationToken
     * @returns {boolean}
     */
    unsubscribe_balance(socket, addresses, options) {

        if (!_.isNull(addresses) && !this.addressesIsValid(addresses)) {
            return false;
        }

        this.events.qtumRoomEvents.unsubscribeAddress(socket, addresses);

        if (options.notificationToken) {
            this.mobileAddressBalanceNotifier.unsubscribeAddress(options.notificationToken, addresses);
        }

    }

    /**
     * @param {Object} socket - Socket emitter
     * @param {*} payload
     * @param options
     */
    unsubscribe_token_balance(socket, payload, options) {
        this.events.tokenBalanceEvents.unsubscribeAddress(socket, payload);
        
        if (options.notificationToken) {
            this.mobileContractBalanceNotifier.unsubscribeMobileTokenBalance(options.notificationToken, payload && payload.contract_address ? payload.contract_address : null, payload && payload.addresses ? payload.addresses : null, () => {});
        }
    }

    /**
     * @param {Object} socket - Socket emitter
     * @param {*} payload
     */
    unsubscribe_contract_purchase(socket, payload) {

        this.events.contractPurchaseEvents.unsubscribe(socket, payload);

    }

    /**
     *
     * @param {*} addresses
     * @returns {boolean}
     */
    addressesIsValid(addresses) {

        if (!_.isArray(addresses)) {
            return false;
        }

        if (!addresses.length) {
            return false;
        }

        let invalidAddress = addresses.find((address) => {
            return !Address.isValid(address, config.NETWORK);
        });

        return !invalidAddress;

    }

    /**
     *
     * @param {Object} socket - Socket emitter
     * @returns {*}
     * @private
     */
    _getRemoteAddress(socket) {
        return socket.client.request.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
    };
}

Controllers.socket = new SocketController();