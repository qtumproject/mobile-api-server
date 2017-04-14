let InsightApi = require("../Repositories/InsightApi"),
    HistoryService = require("../Services/HistoryService"),
    logger = require('log4js').getLogger('Socket Controller'),
    config = require('../../config/main.json'),
    socketIO = require('socket.io'),
    socketIOClient = require('socket.io-client');

const TokenBalanceChangeEvents = require('../Components/SocketEvents/TokenBalanceChangeEvents');
const QtumRoomEvents = require('../Components/SocketEvents/QtumRoomEvents');

let Controllers = getControllers();

class SocketController {

    constructor() {
        logger.info('Init');
        this.socket = null;
        this.socketClient = null;
        this.events = {};
    }

    init(server) {
        this.initSocket(server);
        this.initRemoteSocket(config.INSIGHT_API_SOCKET_SERVER);
        this.initSocketEvents();
    }

    initSocketEvents() {
        this.events.tokenBalanceEvents = new TokenBalanceChangeEvents(this.socket, this.socketClient);
        this.events.qtumRoomEvents = new QtumRoomEvents(this.socket, this.socketClient);
    }

    initSocket(server) {
        this.socket = socketIO.listen(server);
        this.socket.on('connection', this.socketHandler.bind(this));
    }

    initRemoteSocket(SOCKET_SERVER) {
        this.socketClient = socketIOClient(SOCKET_SERVER);
    }

    socketHandler(socket) {

        let remoteAddress = this._getRemoteAddress(socket);

        logger.info('a user connected', remoteAddress);

        socket.on('subscribe', (name, params) => {

            logger.info(remoteAddress, 'Web socket subscribe:', name, params);

            switch (name) {
                case 'balance_subscribe':
                    this.events.qtumRoomEvents.subscribeAddress(socket, params);
                    break;
                case 'token_balance_change':
                    this.events.tokenBalanceEvents.subscribeAddress(socket, params);
                    break;
            }

        });

        socket.on('unsubscribe', (name, params) => {

            logger.info(remoteAddress, 'Web socket unsubscribe:', name);

            switch (name) {
                case 'balance_subscribe':
                    this.events.qtumRoomEvents.unsubscribeAddress(socket, params);
                    break;
                case 'token_balance_change':
                    this.events.tokenBalanceEvents.unsubscribeAddress(socket, params);
                    break;
            }

        });

        socket.on('disconnect', () => {

            this.events.qtumRoomEvents.unsubscribeAddress(socket);
            this.events.tokenBalanceEvents.unsubscribeAddress(socket);

            logger.info('User disconnected', remoteAddress);

        });

    }

    _getRemoteAddress(socket) {
        return socket.client.request.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
    };
}

Controllers.socket = new SocketController();