const InsightApi = require("../Services/InsightApi");
const HistoryService = require("../Services/HistoryService");
const logger = require('log4js').getLogger('Socket Controller');
const config = require('../../config/main.json');
const socketIO = require('socket.io');
const socketIOClient = require('socket.io-client');
const _ = require('lodash');

class SocketController {

    constructor() {
        logger.info('Init');
        this.socket = null;
        this.socketClient = null;

        this.subscriptions = {};
        this.subscriptions.address = {};
        this.subscriptions.emitterAddress = {};

    }

    init(server) {

        this.initSocket(server);
        this.initRemoteSocket(config.INSIGHT_API_SOCKET_SERVER);

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

            self.subscribeRemoteQtumRoom();

        });

        this.socketClient.on('disconnect', function() {
            logger.info('disconnect socketClient');
        });

        this.subscribeToQtumBlock();
        this.subscribeToQtumTrx();

    }

    subscribeToQtumBlock() {
        var self = this;

        this.socketClient.on('qtum/block', function (data) {

            if (data && data.transactions) {

                var addresses = {};

                data.transactions.forEach(function (transaction) {
                    var trxAddresses = {};

                    if (transaction.vout) {

                        transaction.vout.forEach(function (vOut) {

                            if (vOut && vOut.scriptPubKey && vOut.scriptPubKey.addresses && vOut.scriptPubKey.addresses.length) {
                                addresses[vOut.scriptPubKey.addresses[0]] = vOut.scriptPubKey.addresses[0];
                                trxAddresses[vOut.scriptPubKey.addresses[0]] = vOut.scriptPubKey.addresses[0];
                            }

                        });

                    }

                    if (transaction.vin) {

                        transaction.vin.forEach(function (vIn) {

                            if (vIn.addr) {
                                addresses[vIn.addr] = vIn.addr;
                                trxAddresses[vIn.addr] = vIn.addr;
                            }

                        });

                    }

                    self.notifyNewTransaction(Object.keys(trxAddresses), transaction.txid, {withHeight: true});

                });

                self.notifyBalanceChanged(Object.keys(addresses));

            }

        });
    }
    subscribeToQtumTrx() {
        var self = this;

        this.socketClient.on('qtum/tx', function (data) {

            var addresses = {};

            if (data) {
                if (data.vout && data.vout.length) {
                    data.vout.forEach(function (vOut) {

                        if (vOut && vOut.address && !addresses[vOut.address]) {
                            addresses[vOut.address] = vOut.address;
                        }

                    });
                }

                if (data.vin && data.vin.length) {

                    data.vin.forEach(function (vIn) {

                        if (vIn.address && !addresses[vIn.address]) {
                            addresses[vIn.address] = vIn.address;
                        }

                    });

                }

                self.notifyNewTransaction(Object.keys(addresses), data.txid, {withHeight: false});
            }



        });
    }

    notifyNewTransaction(addresses, txid, options) {

        if (!addresses || !addresses.length) {
            return;
        }

        var self = this,
            emitters = this.getEmittersByAddresses(addresses);

        if (emitters.length) {
            self.notifyNewTransactionEmitters(emitters, txid, options);
        }
    }

    notifyBalanceChanged(addresses) {

        if (!addresses || !addresses.length) {
            return;
        }

        var self = this,
            emitters = this.getEmittersByAddresses(addresses);


        if (emitters.length) {
            self.notifyBalanceChangedEmitters(emitters);
        }


    }

    notifyNewTransactionEmitters(emitters, txid, options) {
        var self = this,
            withHeight = options.withHeight;



        InsightApi.getTrx(txid, function (err, data) {

            if (err) return false;

            if (data) {

                var formatHistoryItem = HistoryService.formatHistoryItem(data);

                if (formatHistoryItem && ((withHeight && parseInt(formatHistoryItem.block_height) !== -1) || (!withHeight && parseInt(formatHistoryItem.block_height) === -1))) {

                    emitters.forEach(function (emitter) {

                        self.notifyNewTransactionEmitter(emitter, formatHistoryItem);

                    });

                }


            }

        });

    }

    notifyBalanceChangedEmitters(emitters) {
        var self = this;

        emitters.forEach(function (emitter) {

            self.notifyBalanceChangedEmitter(emitter);

        });
    }

    notifyNewTransactionEmitter(emitter, data) {
        emitter.emit('new_transaction', data);
    }

    notifyBalanceChangedEmitter(emitter) {

        if (this.subscriptions.emitterAddress[emitter.id]) {

            InsightApi.getAddressesBalance(this.subscriptions.emitterAddress[emitter.id], function (err, data) {
                if (err) {
                    return;
                }

                emitter.emit('balance_changed', data);
            });

        }



    }

    getEmittersByAddresses(addresses) {
        var emitters = [];
        var self = this;
        addresses.forEach(function (address) {

            if (self.subscriptions.address[address]) {
                self.subscriptions.address[address].forEach(function (emitter) {

                    if (emitters.indexOf(emitter) === -1) {
                        emitters.push(emitter);
                    }

                });
            }

        });

        return emitters;
    }


    subscribeRemoteQtumRoom() {
        this.socketClient.emit('subscribe', 'qtum');
    }

    socketHandler(socket) {

        var self = this,
            remoteAddress = this._getRemoteAddress(socket);

        logger.info('a user connected', remoteAddress);

        socket.on('subscribe', function (name, params) {

            logger.info(remoteAddress, 'web socket subscribe:', name, params);

            switch (name) {
                case 'balance_subscribe':
                    self.subscribeAddress(socket, params);
                    break;
            }

        });

        socket.on('unsubscribe', function(name, params) {
            logger.info(remoteAddress, 'web socket unsubscribe:', name);

            switch (name) {
                case 'balance_subscribe':
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

        if (!_.isArray(addresses)) {
            return false;
        }

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

            if (self.subscriptions.emitterAddress[emitter.id]) {
                var addrs = self.subscriptions.emitterAddress[emitter.id];
                var index = addrs.indexOf(addressStr);
                if (index === -1) {
                    self.subscriptions.emitterAddress[emitter.id].push(addressStr);
                }
            } else {
                self.subscriptions.emitterAddress[emitter.id] = [addressStr]
            }

        }

        for(var i = 0; i < addresses.length; i++) {
            //TODO::validate
            // if (bitcore.Address.isValid(addresses[i], this.node.network)) {
            addAddress(addresses[i]);
            logger.info('addAddress', addresses[i]);
            // }
        }

        self.notifyBalanceChanged(self.subscriptions.emitterAddress[emitter.id]);

        logger.info('subscribe:', 'balance_subscribe', 'total:', _.size(this.subscriptions.address));
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
                }
            }

            var addrs = self.subscriptions.emitterAddress[emitter.id];
            var addrIndex = addrs.indexOf(addressStr);

            if(addrIndex > -1) {
                addrs.splice(addrIndex, 1);
                if (addrs.length === 0) {
                    delete self.subscriptions.emitterAddress[emitter.id];
                }
            }
        }

        for(var i = 0; i < addresses.length; i++) {
            if(this.subscriptions.address[addresses[i]]) {
                removeAddress(addresses[i]);
            }
        }

        logger.info('unsubscribe:', 'balance_subscribe', 'total:', _.size(this.subscriptions.address));
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
            }
        }

        if (this.subscriptions.emitterAddress[emitter.id]) {
            delete this.subscriptions.emitterAddress[emitter.id];
        }

        logger.info('unsubscribe:', 'balance_subscribe', 'total:', _.size(this.subscriptions.address));
    };

    _getRemoteAddress(socket) {
        return socket.client.request.headers['cf-connecting-ip'] || socket.conn.remoteAddress;
    };
}

module.exports = SocketController;