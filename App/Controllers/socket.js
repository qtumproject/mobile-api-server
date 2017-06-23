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
const ContractBalance = require('../Components/ContractBalance');

let Controllers = getControllers();

class SocketController {

    constructor() {
        logger.info('Init');
        this.socket = null;
        this.socketClient = null;
        this.events = {};
    }

    init(server) {

        this.contractBalanceComponent = new ContractBalance();
        this.mobileContractBalanceNotifier = new MobileContractBalanceNotifier(this.contractBalanceComponent);

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
        this.events.tokenBalanceEvents = new TokenBalanceChangeEvents(this.socket, this.contractBalanceComponent);
        this.events.qtumRoomEvents = new QtumRoomEvents(this.socket, this.socketClient);
    }

    socketHandler(socket) {

        let remoteAddress = this._getRemoteAddress(socket);

        logger.info('a user connected', remoteAddress);

        socket.on('subscribe', (name, params, nextToken, prevTokenId) => {

            logger.info(remoteAddress, 'Web socket subscribe:', name, params, nextToken, prevTokenId);

            switch (name) {
                case 'balance':
                case 'balance_subscribe':

                    this.subscribe_balance_change(params, nextToken, prevTokenId);

                    break;
                case 'token_balance_change':

                    this.subscribe_token_balance_change(params, nextToken, prevTokenId);

                    break;
            }

        });

        socket.on('unsubscribe', (name, params, tokenId) => {

            logger.info(remoteAddress, 'Web socket unsubscribe:', name);

            switch (name) {
                case 'balance':
                case 'balance_subscribe':

                    this.unsubscribe_balance(params, tokenId);

                    break;
                case 'token_balance_change':

                    this.unsubscribe_token_balance(params, tokenId);

                    break;
            }

        });

        socket.on('disconnect', () => {

            this.events.qtumRoomEvents.unsubscribeAddress(socket);
            this.events.tokenBalanceEvents.unsubscribeAddress(socket);

            logger.info('User disconnected', remoteAddress);

        });

    }

    subscribe_balance_change(params, nextToken, prevTokenId) {
        if (!_.isArray(params) || !params.length) {
            return false;
        }

        this.events.qtumRoomEvents.subscribeAddress(socket, params);

        if (nextToken) {
            this.mobileAddressBalanceNotifier.subscribeAddress(nextToken, prevTokenId, params);
        }
    }

    subscribe_token_balance_change(params, nextToken, prevTokenId) {

        if (!_.isObject(params) || !params.contract_address || !_.isString(params.contract_address) || !params.addresses || !_.isArray(params.addresses) || !params.addresses.length) {
            return false;
        }

        let validAddresses = [],
            addresses = params.addresses,
            contractAddress = params.contract_address;

        for(let i = 0; i < addresses.length; i++) {

            if (Address.isValid(addresses[i], config.NETWORK)) {
                validAddresses.push(addresses[i]);
            } else {
                logger.info('not valid address', contractAddress, addresses[i]);
            }

        }

        if (!validAddresses.length) {
            return false;
        }

        this.events.tokenBalanceEvents.subscribeAddress(socket, params);

        if (nextToken && validAddresses.length) {
            this.mobileContractBalanceNotifier.subscribeMobileTokenBalance(nextToken, prevTokenId, contractAddress, validAddresses);
        }
    }

    unsubscribe_balance(params, tokenId) {
        this.events.qtumRoomEvents.unsubscribeAddress(socket, params);

        if (tokenId) {
            this.mobileAddressBalanceNotifier.unsubscribeAddress(tokenId, params);
        }
    }

    unsubscribe_token_balance(params, tokenId) {
        this.events.tokenBalanceEvents.unsubscribeAddress(socket, params);

        if (_.isObject(params) && tokenId) {
            this.mobileContractBalanceNotifier.unsubscribeMobileTokenBalance(tokenId, params.contract_address, params.addresses, () => {});
        }
    }

    _getRemoteAddress(socket) {
        return socket.client.request.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
    };
}

Controllers.socket = new SocketController();