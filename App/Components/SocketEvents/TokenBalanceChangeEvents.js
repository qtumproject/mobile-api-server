const _ = require('lodash');
const async = require('async');
const logger = require('log4js').getLogger('TokenBalanceChange Socket Events');
const TokenInterface = require('../ContractData/TokenInterface');
const ContractsInfoService = require('../../Services/ContractsInfoService');
const Address = require('../../Components/Address');
const config = require('../../../config/main.json');
const bs58 = require('bs58');
const BALANCE_CHECKER_TIMER_MS = 60000;

class TokenBalanceChangeEvents {

    constructor(socket) {
        logger.info('Init');

        this.socket = socket;
        this.subscriptions = {};
        this.subscriptions.contract_address = {};
        this.subscriptions.emitterAddresses = {};
        this.subscriptions.emitterAddressesBalance = {};
        this.contractsInfoService = new ContractsInfoService(TokenInterface.interface, TokenInterface.functionHashes);

        this.runBalanceChecker();
    }

    subscribeAddress(emitter, data) {

        if (!_.isObject(data) || !data.contract_address || !data.addresses || !data.addresses.length) {
            return false;
        }

        let self = this,
            contract_address = data.contract_address,
            addresses = data.addresses;

        function addContractAddress(addressStr) {
            if(self.subscriptions.contract_address[addressStr]) {

                let emitters = self.subscriptions.contract_address[addressStr],
                    index = emitters.indexOf(emitter);

                if (index === -1) {
                    self.subscriptions.contract_address[addressStr].push(emitter);
                }

            } else {
                self.subscriptions.contract_address[addressStr] = [emitter];
            }
        }

        function addAddress(addressContract, addr) {

            let uniqueKey = self.getUniqueContractKey(emitter, addressContract);

            if (self.subscriptions.emitterAddresses[uniqueKey]) {

                let addrs = self.subscriptions.emitterAddresses[uniqueKey],
                    index = addrs.indexOf(addr);

                if (index === -1) {
                    self.subscriptions.emitterAddresses[uniqueKey].push(addr);
                }

            } else {
                self.subscriptions.emitterAddresses[uniqueKey] = [addr]
            }

            self.setEmitterAddressesBalance(emitter, addr, 0, false);

        }

        for(let i = 0; i < addresses.length; i++) {

            if (Address.isValid(addresses[i], config.NETWORK)) {

                addContractAddress(contract_address);
                addAddress(contract_address, addresses[i]);

                logger.info('addAddress', contract_address, addresses[i]);

            } else {
                logger.info('not addAddress', contract_address, addresses[i]);
            }

        }

        this.notifyTokenBalanceChange(contract_address, emitter);
    };

    getBalance(contractAddress, address, cb) {
        try {
            let hexAddress = new Buffer(bs58.decode(address)).toString('hex'),
                onlyAddress = '0x' + hexAddress.slice(2, -8),
                solidityParam = this.contractsInfoService.createParam('balanceOf', [onlyAddress]);

            this.contractsInfoService.fetchInfoBySolidityParams(contractAddress, [solidityParam], (err, result) => {
                cb(err, result);
            });

        } catch (e) {
            cb(e.message);
        }
    }

    notifyTokenBalanceChange(contractAddress, emitter) {

        let uniqueKey = this.getUniqueContractKey(emitter, contractAddress),
            addresses = this.subscriptions.emitterAddresses[uniqueKey],
            balances = [];

        async.each(addresses, (address, callback) => {

            this.getBalance(contractAddress, address, (err, data) => {

                let balance;

                if (err || !data) {
                    balance = {
                        address: address,
                        balance: 0
                    };
                } else {
                    balance = {
                        address: address,
                        balance: data.balanceOf
                    };
                }

                balances.push(balance);

                this.setEmitterAddressesBalance(emitter, balance.address, balance.balance, true);

                callback();

            });

        }, () => {

            emitter.emit('token_balance_change', {
                contract_address: contractAddress,
                balances: balances
            });

        });

    }

    unsubscribeAddress(emitter, data) {

        if(!data) {
            return this.unsubscribeAddressAll(emitter);
        }

        if (!_.isObject(data) || !data.contract_address || !data.addresses || !data.addresses.length) {
            return false;
        }

        let self = this,
            contract_address = data.contract_address,
            addresses = data.addresses;

        function removeAddress(addressContract, addr) {

            let uniqueKey = self.getUniqueContractKey(emitter, addressContract),
                addrs = self.subscriptions.emitterAddresses[uniqueKey],
                addrIndex = addrs.indexOf(addr);

            if(addrIndex > -1) {
                addrs.splice(addrIndex, 1);

                delete self.subscriptions.emitterAddressesBalance[self.getUniqueAddressKey(emitter, addr)];

                if (addrs.length === 0) {

                    delete self.subscriptions.emitterAddresses[uniqueKey];

                    if (self.subscriptions.contract_address[addressContract]) {
                        let emitterIndex = self.subscriptions.contract_address[addressContract].indexOf(emitter);
                        self.subscriptions.contract_address[addressContract].splice(emitterIndex, 1);

                        if (self.subscriptions.contract_address[addressContract].length === 0) {
                            delete self.subscriptions.contract_address[addressContract];
                        }

                    }

                }

            }
        }

        for(let i = 0; i < addresses.length; i++) {
            if(this.subscriptions.contract_address[contract_address] && Address.isValid(addresses[i], config.NETWORK)) {
                removeAddress(contract_address, addresses[i]);
            }
        }

        logger.info('unsubscribe:', 'token_balance_change', 'total:', _.size(this.subscriptions.contract_address));

    };

    unsubscribeAddressAll(emitter) {

        for(let addressContract in this.subscriptions.contract_address) {

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
                })


            }
        }

        logger.info('unsubscribe:', 'token_balance_change', 'total:', _.size(this.subscriptions.address));

    };

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

    checkAddressesBalances(contractAddress, addresses, next) {

        let balances = {};

        async.each(addresses, (address, callback) => {

            this.getBalance(contractAddress, address, (err, data) => {

                if (err || !data) {
                    balances[address] = 0;
                } else {
                    balances[address] = data.balanceOf;
                }

                callback();

            });

        }, () => {

            let emitters = this.subscriptions.contract_address[contractAddress];

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

            next();

        });

    }

    runBalanceChecker() {

        let contracts = Object.keys(this.subscriptions.contract_address),
            self = this;

        function runChecker() {
            setTimeout(() => {
                self.runBalanceChecker();
            }, BALANCE_CHECKER_TIMER_MS);
        }

        if (!contracts.length) {
            return runChecker();
        }

        async.each(contracts, (contractAddress, callback) => {

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

                this.checkAddressesBalances(contractAddress, allContractAddresses, () => {
                    callback();
                });

            } else {
                callback();
            }

        }, () => {
            runChecker();
        });

    }

    getUniqueContractKey(emitter, addressContract) {
        return `${emitter.id}_${addressContract}`;
    }

    getUniqueAddressKey(emitter, address) {
        return `${emitter.id}_${address}`;
    }

}

module.exports = TokenBalanceChangeEvents;