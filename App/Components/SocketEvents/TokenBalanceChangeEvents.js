const _ = require('lodash');
const async = require('async');
const logger = require('log4js').getLogger('TokenBalanceChange Socket Events');
const TransactionService = require('../../Services/TransactionService');
const ContractsHelper = require('../../Helpers/ContractsHelper');
const SolidityCoder = require('../Solidity/SolidityCoder');
const Address = require('../../Components/Address');
const config = require('../../../config/main.json');
const bs58 = require('bs58');
const qtumcoreLib = require('qtumcore-lib');

const ERC20_ZERO_TOPIC_HASH = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';


class TokenBalanceChangeEvents {

    constructor(socket, socketClient, tokenContract) {
        logger.info('Init');

        this.socket = socket;
        this.socketClient = socketClient;

        this.tokenContract = tokenContract;

        this.subscriptions = {};
        this.subscriptions.contract_address = {};
        this.subscriptions.emitterAddresses = {};

        this.subscribeToQtumBlock();

    }

    subscribeToQtumBlock() {
        this.socketClient.on('qtum/block', (block) => {
            if (block && block.transactions) {
                return async.eachSeries(block.transactions, (trx, callback) => {

                    let formattedTransaction = {};
                    let receipt = null;

                    return TransactionService.getTransaction(trx.txid, (err, transaction) => {

                        if (err) {
                            logger.error('Get transaction error: ', err.message);
                            return callback(err);
                        }

                        if (_.isArray(transaction.receipt) && transaction.receipt.length) {
                            this.processTransactionReceiptLogs(transaction);
                        }

                        return callback();
                    });

                }, (err) => { });
            }

        });

    }


    /**
     *
     * @param {<Object>} transaction
     * @returns {*}
     */
    processTransactionReceiptLogs(transaction) {
        const logs = transaction.receipt[0].log;

        logs.forEach((log) => {
            this.processTransactionReceiptLog(log, transaction);
        });
    }

    /**
     *
     * @param {<Object>} log
     * @param {<Object>} transaction
     * @returns {*}
     */
    processTransactionReceiptLog(log, transaction) {

        const { address: contractAddress, topics, data } = log;

        if (!topics || topics.length !== 3 || topics[0] !== ERC20_ZERO_TOPIC_HASH || !this.subscriptions.contract_address[contractAddress] || !this.subscriptions.contract_address[contractAddress].length) {
            return;
        }

        const parsedTopics = this.parseLogTopics(topics[1], topics[2], data);

        const contractEmitters = this.subscriptions.contract_address[contractAddress];

        this.notifyContractEmitters(contractEmitters, contractAddress, parsedTopics, transaction);
    }

    /**
     *
     * @param {Array.<String>} emitters
     * @param {String} contractAddress
     * @param {Object} parsedTopics
     * @param {Object} transaction
     * @returns {*}
     */
    notifyContractEmitters(emitters, contractAddress, parsedTopics, transaction) {

        const { addressFrom, addressTo, amount } = parsedTopics;
        const notifications = [];

        if (amount === 0) {
            return;
        }

        return async.eachSeries(emitters, (emitter, callback) => {
            let uniqueContractKey = this.getUniqueContractKey(emitter, contractAddress);
            let addresses = this.subscriptions.emitterAddresses[uniqueContractKey];

            let indexFrom = addresses.indexOf(addressFrom);
            let indexTo = addresses.indexOf(addressTo);

            async.parallel([
                (callback) => {

                    if (indexFrom === -1) {
                        return callback();
                    }

                    return this.getTokenBalance(contractAddress, addressFrom, (err, balanceValue) => {
                        if (err) {
                            logger.error('Get balance error: ', err.message);
                        }

                        notifications.push({
                            address: addressFrom,
                            balance: balanceValue,
                        });

                        return callback(err);
                    });
                },
                (callback) => {

                    if (indexTo === -1) {
                        return callback();
                    }

                    return this.getTokenBalance(contractAddress, addressTo, (err, balanceValue) => {
                        if (err) {
                            logger.error('Get balance error: ', err.message);
                        }

                        notifications.push({
                            address: addressTo,
                            balance: balanceValue,
                        });

                        return callback(err);
                    });
                }
            ], (err) => {
                if (!err) {
                    this.emitTokenBalanceChangeEvent(emitter, {
                        contract_address: contractAddress,
                        balances: notifications,
                    });
                    this.emitNewTokenTransactionEvent(emitter, transaction);
                }
            });

        });
    }

    /**
     *
     * @param {String} from
     * @param {String} to
     * @param {String} data
     * @returns {Object}
     */
    parseLogTopics(from, to, data) {
        const solidityCoderUint = new SolidityCoder({ outputs: [{ type: "uint" }], inputs: [{ type: "uint" }] });
        const solidityCoderAddress = new SolidityCoder({ outputs: [{ type: "address" }], inputs: [{ type: "address" }] });

        let addressFrom;
        let addressTo;
        let amount;

        const pubkeyhash = this.getNetworkPubkeyhash().toString(16);

        try {
            amount = solidityCoderUint.unpackOutput(data);
        } catch (err) {
            amount = 0;
            logger.error('Topic amount parse error: ', err.message);
        }

        try {
            let addressFromEth = solidityCoderAddress.unpackOutput(from);
            addressFrom = ContractsHelper.getBitAddressFromContractAddress(addressFromEth, pubkeyhash);
        } catch (err) {
            logger.error('Topic address from parse error: ', err.message);
        }

        try {
            let addressToEth = solidityCoderAddress.unpackOutput(to);
            addressTo = ContractsHelper.getBitAddressFromContractAddress(addressToEth, pubkeyhash);
        } catch (err) {
            logger.error('Topic address to parse error: ', err.message);
        }

        return { addressFrom, addressTo, amount };

    }

    /**
     *
     * @returns {Number}
     */
    getNetworkPubkeyhash() {
        if (config.NETWORK = 'testnet') {
            return qtumcoreLib.Networks.get('testnet').pubkeyhash;
        }
        if (config.NETWORK = 'livenet') {
            return qtumcoreLib.NETWORK.get('livenet').pubkeyhash;
        }
    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {Object} data
     * @returns {*}
     */
    subscribeAddress(emitter, data) {

        if (!_.isObject(data) || !data.contract_address || !_.isString(data.contract_address) || !data.addresses || !_.isArray(data.addresses) || !data.addresses.length) {
            return false;
        }

        let contract_address = data.contract_address,
            addresses = data.addresses,
            validAddresses = [];

        for (let i = 0; i < addresses.length; i++) {

            if (Address.isValid(addresses[i], config.NETWORK)) {

                validAddresses.push(addresses[i]);

                this.addContractAddress(emitter, contract_address);
                this.addAddress(emitter, contract_address, addresses[i]);

                logger.info('addAddress', contract_address, addresses[i]);

            } else {
                logger.info('not addAddress', contract_address, addresses[i]);
            }

        }

        this.notifyTokenBalanceChange(contract_address, emitter);
    }

    /**
    *
    * @param {Object} emitter
    * @param {Object} transaction
    */
    emitNewTokenTransactionEvent(emitter, transaction) {
        emitter.emit('new_token_transaction', transaction);
    }

    /**
    *
    * @param {Object} emitter
    * @param {Object} message
    */
    emitTokenBalanceChangeEvent(emitter, message) {
        emitter.emit('token_balance_change', message);
    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} addressContract
     * @param {String} addr
     */
    addAddress(emitter, addressContract, addr) {

        let uniqueKey = this.getUniqueContractKey(emitter, addressContract);

        if (this.subscriptions.emitterAddresses[uniqueKey]) {

            let addrs = this.subscriptions.emitterAddresses[uniqueKey],
                index = addrs.indexOf(addr);

            if (index === -1) {
                this.subscriptions.emitterAddresses[uniqueKey].push(addr);
            }

        } else {
            this.subscriptions.emitterAddresses[uniqueKey] = [addr]
        }

    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} addressStr
     */
    addContractAddress(emitter, addressStr) {

        if (this.subscriptions.contract_address[addressStr]) {

            let emitters = this.subscriptions.contract_address[addressStr],
                index = emitters.indexOf(emitter);

            if (index === -1) {
                this.subscriptions.contract_address[addressStr].push(emitter);
            }

        } else {
            this.subscriptions.contract_address[addressStr] = [emitter];
        }

    }


    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {Object.<{contract_address: String, addresses: Array.<String>}>} data
     * @returns {*}
     */
    unsubscribeAddress(emitter, data) {

        if (!data) {
            return this.unsubscribeAddressAll(emitter);
        }

        if (!_.isObject(data) || !data.contract_address) {
            return false;
        }

        let contract_address = data.contract_address,
            addresses = data.addresses;

        if (!addresses) {

            let currentAddresses = this.subscriptions.emitterAddresses[this.getUniqueContractKey(emitter, contract_address)];

            if (currentAddresses) {
                addresses = _.clone(currentAddresses);
            }

        }

        if (addresses && addresses.length) {

            for (let i = 0; i < addresses.length; i++) {
                if (this.subscriptions.contract_address[contract_address] && Address.isValid(addresses[i], config.NETWORK)) {

                    this.removeAddress(emitter, contract_address, addresses[i]);

                }
            }

        }

        logger.info('unsubscribe:', 'token_balance_change', 'total:', _.size(this.subscriptions.contract_address));

    };

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} addressContract
     * @param {String} addr
     */
    removeAddress(emitter, addressContract, addr) {

        let uniqueKey = this.getUniqueContractKey(emitter, addressContract),
            addrs = this.subscriptions.emitterAddresses[uniqueKey];

        if (!addrs) {
            return false;
        }

        let addrIndex = addrs.indexOf(addr);

        if (addrIndex > -1) {
            addrs.splice(addrIndex, 1);

            if (addrs.length === 0) {

                delete this.subscriptions.emitterAddresses[uniqueKey];

                if (this.subscriptions.contract_address[addressContract]) {

                    let emitterIndex = this.subscriptions.contract_address[addressContract].indexOf(emitter);
                    this.subscriptions.contract_address[addressContract].splice(emitterIndex, 1);

                    if (this.subscriptions.contract_address[addressContract].length === 0) {
                        delete this.subscriptions.contract_address[addressContract];
                    }

                }

            }

        }
    }

    /**
     *
     * @param emitter - Socket emitter
     */
    unsubscribeAddressAll(emitter) {

        for (let addressContract in this.subscriptions.contract_address) {

            if (!this.subscriptions.contract_address.hasOwnProperty(addressContract)) {
                continue;
            }

            let emitters = this.subscriptions.contract_address[addressContract],
                index = emitters.indexOf(emitter);

            if (index > -1) {
                emitters.splice(index, 1);
            }

            if (emitters.length === 0) {
                delete this.subscriptions.contract_address[addressContract];
            }

            let uniqueKey = this.getUniqueContractKey(emitter, addressContract);

            if (this.subscriptions.emitterAddresses[uniqueKey]) {
                let addressesForDelete = this.subscriptions.emitterAddresses[uniqueKey];

                delete this.subscriptions.emitterAddresses[uniqueKey];
            }
        }

        logger.info('unsubscribe:', 'token_balance', 'total:', _.size(this.subscriptions.address));

    };

    /**
     *
     * @param {String} contractAddress
     * @param {Object} emitter - Socket emitter
     * @returns {*}
     */
    notifyTokenBalanceChange(contractAddress, emitter) {

        let uniqueKey = this.getUniqueContractKey(emitter, contractAddress),
            addresses = this.subscriptions.emitterAddresses[uniqueKey],
            balances = [];

        return async.eachSeries(addresses, (address, callback) => {

            return this.getTokenBalance(contractAddress, address, (err, balanceValue) => {
                if (err) {
                    logger.error('Get token balance error: ', err.message);
                }

                balances.push({
                    address: address,
                    balance: balanceValue,
                });

                return callback(err);
            })

        }, (err) => {

            if (!err) {
                this.emitTokenBalanceChangeEvent(emitter, {
                    contract_address: contractAddress,
                    balances: balances,
                });
            }

        });

    }


    /**
     *
     * @param {String} contractAddress
     * @param {String} address
     * @param {Function} next
     * @returns {*}
     */
    getTokenBalance(contractAddress, address, next) {
        return this.tokenContract.getBalance(contractAddress, address, (err, balance) => {
            return (err || !balance) ? next(err, '0') : next(err, balance.balanceOf);
        });
    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} addressContract
     * @returns {String}
     */
    getUniqueContractKey(emitter, addressContract) {
        return `${emitter.id}_${addressContract}`;
    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} address
     * @returns {String}
     */
    getUniqueAddressKey(emitter, address) {
        return `${emitter.id}_${address}`;
    }

}

module.exports = TokenBalanceChangeEvents;