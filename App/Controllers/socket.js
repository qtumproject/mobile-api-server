let InsightApi = require("../Services/InsightApi"),
    logger = require('log4js').getLogger('Socket Controller'),
    config = require('../../config/main.json'),
    socketIO = require('socket.io'),
    socketIOClient = require('socket.io-client'),
    _ = require('lodash');

class SocketController {

    constructor() {
        logger.info('Init');
        this.socket = null;
        this.socketClient = null;

        this.subscriptions = {};
        this.subscriptions.address = {};

    }

    init(server) {

        this.initSocket(server);
        this.initRemoteSocket(config.INSIGHT_API_SOCKET_SERVER);

    }

    sendTestEvent(cb) {
        var objects = Object.keys(this.subscriptions.address);

        var addrs = [];
        objects.forEach((address) => {
            for (var idx in this.subscriptions.address[address]) {
                addrs.push(address);
                this.subscriptions.address[address][idx].emit('quantumd/test', {
                    test1: 'test',
                    test2: 'test',
                    test3: 'test'
                });
            }
        });
        logger.info('sendTestEvent');
        cb(null, addrs);
    }

    initSocket(server) {
        this.socket = socketIO.listen(server);
        this.socket.on('connection', this.socketHandler.bind(this));
    }

    initRemoteSocket(SOCKET_SERVER) {

        var self = this;

        this.socketClient = socketIOClient(SOCKET_SERVER);

        this.socketClient.on('connect', function() {

            logger.info('connect socketClient');

            for (var addr in self.subscriptions.address) {
                self.subscribeRemoteAddress([addr]);
            }
            logger.info('subscribe:', 'quantumd/addressbalance', 'total:', _.size(self.subscriptions.address));
        });

        this.socketClient.on('disconnect', function() {
            logger.info('disconnect socketClient');
        });

        this.socketClient.on('quantumd/addressbalance', function (data) {

            if (self.subscriptions.address[data.address] && self.subscriptions.address[data.address].length) {

                for (var idx in self.subscriptions.address[data.address]) {
                    self.subscriptions.address[data.address][idx].emit('quantumd/addressbalance', data);
                }
            }

        });
    }

    subscribeRemoteAddress(addresses) {
        this.socketClient.emit('subscribe', 'quantumd/addressbalance', addresses);
    }

    unsubscribeRemoteAddress(addresses) {
        this.socketClient.emit('unsubscribe', 'quantumd/addressbalance', addresses);
    }

    socketHandler(socket) {

        var self = this,
            remoteAddress = this._getRemoteAddress(socket);

        logger.info('a user connected', remoteAddress);

        socket.on('subscribe', function (name, params) {

            logger.info(remoteAddress, 'web socket subscribe:', name, params);

            switch (name) {
                case 'quantumd/addressbalance':
                    self.subscribeAddress(socket, params);
                    break;
            }

        });

        socket.on('unsubscribe', function(name, params) {
            logger.info(remoteAddress, 'web socket unsubscribe:', name);

            switch (name) {
                case 'quantumd/addressbalance':
                    self.unsubscribeAddress(socket, params);
                    break;
            }

        });

        socket.on('disconnect', function() {
            self.unsubscribeAddress(socket);
            logger.info('user disconnected', remoteAddress);
        });
    }

    subscribeAddress(emitter, addresses) {
        var self = this;

        function addAddress(addressStr) {
            if(self.subscriptions.address[addressStr]) {
                var emitters = self.subscriptions.address[addressStr];
                var index = emitters.indexOf(emitter);
                if (index === -1) {
                    self.subscriptions.address[addressStr].push(emitter);
                }
            } else {
                self.subscriptions.address[addressStr] = [emitter];
            }
            self.subscribeRemoteAddress([addressStr]);
        }

        for(var i = 0; i < addresses.length; i++) {
            //TODO::validate
            // if (bitcore.Address.isValid(addresses[i], this.node.network)) {
                addAddress(addresses[i]);
            logger.info('addAddress', addresses[i]);
            // }
        }

        logger.info('subscribe:', 'quantumd/addressbalance', 'total:', _.size(this.subscriptions.address));
    };

    unsubscribeAddress(emitter, addresses) {
        var self = this;

        if(!addresses) {
            return this.unsubscribeAddressAll(emitter);
        }

        function removeAddress(addressStr) {
            var emitters = self.subscriptions.address[addressStr];
            var index = emitters.indexOf(emitter);
            if(index > -1) {
                emitters.splice(index, 1);
                if (emitters.length === 0) {
                    delete self.subscriptions.address[addressStr];
                    self.unsubscribeRemoteAddress([addressStr]);
                }
            }
        }

        for(var i = 0; i < addresses.length; i++) {
            if(this.subscriptions.address[addresses[i]]) {
                removeAddress(addresses[i]);
            }
        }

        logger.info('unsubscribe:', 'quantumd/addressbalance', 'total:', _.size(this.subscriptions.address));
    };

    unsubscribeAddressAll(emitter) {
        for(var hashHex in this.subscriptions.address) {
            var emitters = this.subscriptions.address[hashHex];
            var index = emitters.indexOf(emitter);
            if(index > -1) {
                emitters.splice(index, 1);
            }
            if (emitters.length === 0) {
                delete this.subscriptions.address[hashHex];
                this.unsubscribeRemoteAddress([hashHex]);
            }
        }
        logger.info('unsubscribe:', 'quantumd/addressbalance', 'total:', _.size(this.subscriptions.address));
    };

    _getRemoteAddress(socket) {
        return socket.client.request.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
    };

}

module.exports = SocketController;