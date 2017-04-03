let InsightApi = require("../Services/InsightApi"),
    HistoryService = require("../Services/HistoryService"),
    logger = require('log4js').getLogger('Socket Controller'),
    config = require('../../config/main.json'),
    socketIO = require('socket.io'),
    socketIOClient = require('socket.io-client'),
     _ = require('lodash');

let Controllers = getControllers();

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

        this.socketClient = socketIOClient(SOCKET_SERVER);

        this.socketClient.on('connect', () => {
            logger.info('connect socketClient');
            this.subscribeRemoteQtumRoom();
        });

        this.socketClient.on('disconnect', () => {
            logger.info('disconnect socketClient');
        });

        this.subscribeToQtumBlock();
        this.subscribeToQtumTrx();

    }

    subscribeToQtumBlock() {

        this.socketClient.on('qtum/block', (data) => {

            if (data && data.transactions) {

                let addresses = {};

                data.transactions.forEach((transaction) => {

                    let trxAddresses = {};

                    if (transaction.vout) {
                        transaction.vout.forEach((vOut) => {
                            if (vOut && vOut.scriptPubKey && vOut.scriptPubKey.addresses && vOut.scriptPubKey.addresses.length) {
                                addresses[vOut.scriptPubKey.addresses[0]] = vOut.scriptPubKey.addresses[0];
                                trxAddresses[vOut.scriptPubKey.addresses[0]] = vOut.scriptPubKey.addresses[0];
                            }
                        });
                    }

                    if (transaction.vin) {
                        transaction.vin.forEach((vIn) => {
                            if (vIn.addr) {
                                addresses[vIn.addr] = vIn.addr;
                                trxAddresses[vIn.addr] = vIn.addr;
                            }
                        });
                    }

                    this.notifyNewTransaction(Object.keys(trxAddresses), transaction.txid, {withHeight: true});

                });

                this.notifyBalanceChanged(Object.keys(addresses));

            }

        });
    }
    subscribeToQtumTrx() {

        this.socketClient.on('qtum/tx', (data) => {

            let addresses = {};

            if (data) {

                if (data.vout && data.vout.length) {
                    data.vout.forEach((vOut) => {
                        if (vOut && vOut.address && !addresses[vOut.address]) {
                            addresses[vOut.address] = vOut.address;
                        }
                    });
                }

                if (data.vin && data.vin.length) {
                    data.vin.forEach((vIn) => {
                        if (vIn.address && !addresses[vIn.address]) {
                            addresses[vIn.address] = vIn.address;
                        }
                    });
                }

                let addressKeys = Object.keys(addresses);

                this.notifyNewTransaction(addressKeys, data.txid, {withHeight: false});
                this.notifyBalanceChanged(addressKeys);
            }
        });
    }

    notifyNewTransaction(addresses, txid, options) {

        if (!addresses || !addresses.length) {
            return;
        }

        let emitters = this.getEmittersByAddresses(addresses);

        if (emitters.length) {
            this.notifyNewTransactionEmitters(emitters, txid, options);
        }
    }

    notifyBalanceChanged(addresses) {
        if (!addresses || !addresses.length) {
            return;
        }

        let emitters = this.getEmittersByAddresses(addresses);

        if (emitters.length) {
            this.notifyBalanceChangedEmitters(emitters);
        }
    }

    notifyNewTransactionEmitters(emitters, txid, options) {
        let withHeight = options.withHeight;

        InsightApi.getTrx(txid, (err, data) => {

            if (err) return false;

            if (data) {
                let formatHistoryItem = HistoryService.formatHistoryItem(data);

                if (formatHistoryItem && ((withHeight && parseInt(formatHistoryItem.block_height) !== -1) || (!withHeight && parseInt(formatHistoryItem.block_height) === -1))) {
                    emitters.forEach((emitter) => {
                        this.notifyNewTransactionEmitter(emitter, formatHistoryItem);
                    });
                }
            }

        });
    }

    notifyBalanceChangedEmitters(emitters) {
        emitters.forEach((emitter) => {
            this.notifyBalanceChangedEmitter(emitter);
        });
    }

    notifyNewTransactionEmitter(emitter, data) {
        emitter.emit('new_transaction', data);
    }

    notifyBalanceChangedEmitter(emitter) {
        if (this.subscriptions.emitterAddress[emitter.id]) {
            InsightApi.getAddressesBalance(this.subscriptions.emitterAddress[emitter.id], (err, data) => {
                if (err) {
                    return false;
                }

                emitter.emit('balance_changed', data);
            });
        }
    }

    getEmittersByAddresses(addresses) {
        let emitters = [];

        addresses.forEach((address) => {
            if (this.subscriptions.address[address]) {
                this.subscriptions.address[address].forEach((emitter) => {
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

        let remoteAddress = this._getRemoteAddress(socket);

        logger.info('a user connected', remoteAddress);

        socket.on('subscribe', (name, params) => {

            logger.info(remoteAddress, 'web socket subscribe:', name, params);

            switch (name) {
                case 'balance_subscribe':
                    this.subscribeAddress(socket, params);
                    break;
            }

        });

        socket.on('unsubscribe', (name, params) => {
            logger.info(remoteAddress, 'web socket unsubscribe:', name);

            switch (name) {
                case 'balance_subscribe':
                    this.unsubscribeAddress(socket, params);
                    break;
            }

        });

        socket.on('disconnect', () => {
            this.unsubscribeAddress(socket);
            logger.info('user disconnected', remoteAddress);
        });
    }

    subscribeAddress(emitter, addresses) {

        if (!_.isArray(addresses)) {
            return false;
        }

        let self = this;

        function addAddress(addressStr) {

            if(self.subscriptions.address[addressStr]) {

                let emitters = self.subscriptions.address[addressStr],
                    index = emitters.indexOf(emitter);

                if (index === -1) {
                    self.subscriptions.address[addressStr].push(emitter);
                }

            } else {
                self.subscriptions.address[addressStr] = [emitter];
            }

            if (self.subscriptions.emitterAddress[emitter.id]) {

                let addrs = self.subscriptions.emitterAddress[emitter.id],
                    index = addrs.indexOf(addressStr);

                if (index === -1) {
                    self.subscriptions.emitterAddress[emitter.id].push(addressStr);
                }

            } else {
                self.subscriptions.emitterAddress[emitter.id] = [addressStr]
            }

        }

        for(let i = 0; i < addresses.length; i++) {
            addAddress(addresses[i]);
            logger.info('addAddress', addresses[i]);
        }

        this.notifyBalanceChanged(this.subscriptions.emitterAddress[emitter.id]);

        logger.info('subscribe:', 'balance_subscribe', 'total:', _.size(this.subscriptions.address));
    };

    unsubscribeAddress(emitter, addresses) {

        if(!addresses) {
            return this.unsubscribeAddressAll(emitter);
        }

        let self = this;

        function removeAddress(addressStr) {
            let emitters = self.subscriptions.address[addressStr],
                index = emitters.indexOf(emitter);

            if(index > -1) {
                emitters.splice(index, 1);
                if (emitters.length === 0) {
                    delete self.subscriptions.address[addressStr];
                }
            }

            let addrs = self.subscriptions.emitterAddress[emitter.id],
                addrIndex = addrs.indexOf(addressStr);

            if(addrIndex > -1) {
                addrs.splice(addrIndex, 1);
                if (addrs.length === 0) {
                    delete self.subscriptions.emitterAddress[emitter.id];
                }
            }
        }

        for(let i = 0; i < addresses.length; i++) {
            if(this.subscriptions.address[addresses[i]]) {
                removeAddress(addresses[i]);
            }
        }

        logger.info('unsubscribe:', 'balance_subscribe', 'total:', _.size(this.subscriptions.address));
    };

    unsubscribeAddressAll(emitter) {
        for(let hashHex in this.subscriptions.address) {

            let emitters = this.subscriptions.address[hashHex],
                index = emitters.indexOf(emitter);

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

Controllers.socket = new SocketController();