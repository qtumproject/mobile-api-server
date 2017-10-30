const _ = require('lodash');
const async = require('async');
const logger = require('log4js').getLogger('TokenBalanceChange Socket Events');
const Address = require('../../Components/Address');
const config = require('../../../config/main.json');
const bs58 = require('bs58');
const BALANCE_CHECKER_TIMER_MS = 30000;

class TokenBalanceChangeEvents {

    constructor(socket, tokenContract) {
        logger.info('Init');

        this.socket = socket;
        this.tokenContract = tokenContract;

        this.subscriptions = {};
        this.subscriptions.contract_address = {};
        this.subscriptions.emitterAddresses = {};
        this.subscriptions.emitterAddressesBalance = {};

        this.runBalanceChecker();

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

        for(let i = 0; i < addresses.length; i++) {

            if (Address.isValid(addresses[i], config.NETWORK)) {

                validAddresses.push(addresses[i]);

                this.addContractAddress(emitter, contract_address);
                this.addAddress(emitter, contract_address, addresses[i]);

                logger.info('addAddress', contract_address, addresses[i]);

            } else {
                logger.info('not addAddress', contract_address, addresses[i]);
            }

        }

        return this.notifyTokenBalanceChange(contract_address, emitter);
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

        this.setEmitterAddressesBalance(emitter, addr, '0', false);
    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} addressStr
     */
    addContractAddress(emitter, addressStr) {

        if(this.subscriptions.contract_address[addressStr]) {

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
     * @param {String} contractAddress
     * @param {Object} emitter - Socket emitter
     * @returns {*}
     */
    notifyTokenBalanceChange(contractAddress, emitter) {

        let uniqueKey = this.getUniqueContractKey(emitter, contractAddress),
            addresses = this.subscriptions.emitterAddresses[uniqueKey],
            balances = [];

        return async.eachSeries(addresses, (address, callback) => {

            return this.tokenContract.getBalance(contractAddress, address, (err, data) => {

                let balance;

                if (err || !data) {
                    balance = {
                        address: address,
                        balance: '0'
                    };
                } else {
                    balance = {
                        address: address,
                        balance: data.balanceOf
                    };
                }

                balances.push(balance);

                this.setEmitterAddressesBalance(emitter, balance.address, balance.balance, true);

                return callback(err);

            });

        }, (err) => {

            if (!err) {
                emitter.emit('token_balance_change', {
                    contract_address: contractAddress,
                    balances: balances
                });
            }

        });

    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {Object.<{contract_address: String, addresses: Array.<String>}>} data
     * @returns {*}
     */
    unsubscribeAddress(emitter, data) {

        if(!data) {
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

            for(let i = 0; i < addresses.length; i++) {
                if(this.subscriptions.contract_address[contract_address] && Address.isValid(addresses[i], config.NETWORK)) {

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

        if(addrIndex > -1) {
            addrs.splice(addrIndex, 1);

            delete this.subscriptions.emitterAddressesBalance[this.getUniqueAddressKey(emitter, addr)];

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

        for(let addressContract in this.subscriptions.contract_address) {

            if (!this.subscriptions.contract_address.hasOwnProperty(addressContract)) {
                continue;
            }

            let emitters = this.subscriptions.contract_address[addressContract],
                index = emitters.indexOf(emitter);

            if(index > -1) {
                emitters.splice(index, 1);
            }

            if (emitters.length === 0) {
                delete this.subscriptions.contract_address[addressContract];
            }

            let uniqueKey = this.getUniqueContractKey(emitter, addressContract);

            if (this.subscriptions.emitterAddresses[uniqueKey]) {
                let addressesForDelete = this.subscriptions.emitterAddresses[uniqueKey];

                delete this.subscriptions.emitterAddresses[uniqueKey];

                addressesForDelete.forEach((address) => {
                    delete this.subscriptions.emitterAddressesBalance[this.getUniqueAddressKey(emitter, address)];
                });

            }
        }

        logger.info('unsubscribe:', 'token_balance', 'total:', _.size(this.subscriptions.address));

    };

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} address
     * @param {String} balance
     * @param {Boolean} ifExists
     */
    setEmitterAddressesBalance(emitter, address, balance, ifExists) {

        let uniqueKey = this.getUniqueAddressKey(emitter, address);

        if (ifExists) {
            if (typeof this.subscriptions.emitterAddressesBalance[uniqueKey] !== 'undefined') {
                this.subscriptions.emitterAddressesBalance[uniqueKey] = balance;
            }
        } else {
            this.subscriptions.emitterAddressesBalance[uniqueKey] = balance;
        }

    }

    /**
     *
     * @param {String} contractAddress
     * @param {Array.<String>} addresses
     * @param {Function} next
     * @returns {*}
     */
    checkAddressesBalances(contractAddress, addresses, next) {

        let balances = {};

        return async.eachSeries(addresses, (address, callback) => {

            return this.tokenContract.getBalance(contractAddress, address, (err, data) => {

                if (err || !data) {
                    balances[address] = '0';
                } else {
                    balances[address] = data.balanceOf;
                }

                return callback(err);

            });

        }, (err) => {

            if (err) {
                return next(err);
            }

            let emitters = this.subscriptions.contract_address[contractAddress];

            if (emitters && emitters.length) {


                emitters.forEach((emitter) => {

                    let uniqueContractKey = this.getUniqueContractKey(emitter, contractAddress),
                        addresses = this.subscriptions.emitterAddresses[uniqueContractKey],
                        diffBalances = [];

                    addresses.forEach((address) => {

                        if (typeof balances[address] !== "undefined" && this.subscriptions.emitterAddressesBalance[this.getUniqueAddressKey(emitter, address)] !== balances[address]) {

                            diffBalances.push({
                                address: address,
                                balance: balances[address]
                            });

                            this.setEmitterAddressesBalance(emitter, address, balances[address], true);

                        }

                    });

                    if (diffBalances.length) {
                        emitter.emit('token_balance_change', {
                            contract_address: contractAddress,
                            balances: diffBalances
                        });
                    }

                });

            }

            return next();

        });

    }

    runBalanceCheckerByTimeout() {
        setTimeout(() => {
            this.runBalanceChecker();
        }, BALANCE_CHECKER_TIMER_MS);
    }

    runBalanceChecker() {

        let contracts = Object.keys(this.subscriptions.contract_address);

        if (!contracts.length) {
            return this.runBalanceCheckerByTimeout();
        }

        return async.eachSeries(contracts, (contractAddress, callback) => {

            if (!this.subscriptions.contract_address[contractAddress] || !this.subscriptions.contract_address[contractAddress].length) {
                return callback();
            }

            let emitters = this.subscriptions.contract_address[contractAddress],
                allContractAddresses = {};

            emitters.forEach((emitter) => {

                let uniqueContractKey = this.getUniqueContractKey(emitter, contractAddress),
                    addresses = this.subscriptions.emitterAddresses[uniqueContractKey];

                addresses.forEach((address) => {

                    if (!allContractAddresses[address]) {
                        allContractAddresses[address] = address;
                    }

                });

            });

            let allContractAddressesKeys = Object.keys(allContractAddresses);

            if (allContractAddressesKeys.length) {

                return this.checkAddressesBalances(contractAddress, allContractAddressesKeys, () => {
                    return callback();
                });

            } else {
                return callback();
            }

        }, () => {
            return this.runBalanceCheckerByTimeout();
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