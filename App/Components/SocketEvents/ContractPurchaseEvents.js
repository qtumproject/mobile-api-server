const logger = require('log4js').getLogger('ContractPurchaseEvents Socket Events');
const _ = require('lodash');

class ContractPurchaseEvents {

    constructor(watcher) {

        this.watcher = watcher;
        this.subscriptions = {};
        this.subscriptions.requests = {};

        this.subscribeToWatcher();

    }

    subscribeToWatcher() {

        return this.watcher.eventEmitter.on('contract_purchase', (result) => {

            if (result && result.request_id) {
                this.notifySubscribers(result);
            }

        });

    }

    /**
     *
     * @param {Object} data
     */
    notifySubscribers(data) {

        let emitters = this.subscriptions.requests[data.request_id];

        if (emitters && emitters.length) {

            emitters.forEach((emitter) => {
                emitter.emit('contract_purchase', {
                    contract_id: data.contract_id,
                    request_id: data.request_id,
                    from_addresses: data.from_addresses,
                    payed_at: data.payed_at,
                    created_at: data.created_at,
                    amount: data.amount
                });
            });

        }

    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} requestId
     */
    subscribe(emitter, requestId) {

        if(this.subscriptions.requests[requestId]) {

            let emitters = this.subscriptions.requests[requestId],
                index = emitters.indexOf(emitter);

            if (index === -1) {
                this.subscriptions.requests[requestId].push(emitter);
            }

        } else {
            this.subscriptions.requests[requestId] = [emitter];
        }

        logger.info('subscribe:', 'Subscribed.', 'total:', _.size(this.subscriptions.requests));

    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     * @param {String} requestId
     */
    unsubscribe(emitter, requestId) {

        if(!requestId) {
            return this.unsubscribeAll(emitter);
        }

        if(this.subscriptions.requests[requestId]) {

            let emitters = this.subscriptions.requests[requestId],
                index = emitters.indexOf(emitter);

            if(index > -1) {
                emitters.splice(index, 1);
                if (emitters.length === 0) {
                    delete this.subscriptions.requests[requestId];
                }
            }

        }

        logger.info('unsubscribe', 'total:', _.size(this.subscriptions.requests));

    }

    /**
     *
     * @param {Object} emitter - Socket emitter
     */
    unsubscribeAll(emitter) {

        for(let requestId in this.subscriptions.requests) {

            if (!this.subscriptions.requests.hasOwnProperty(requestId)) {
                continue;
            }

            let emitters = this.subscriptions.requests[requestId],
                index = emitters.indexOf(emitter);

            if(index > -1) {
                emitters.splice(index, 1);
            }

            if (emitters.length === 0) {
                delete this.subscriptions.requests[requestId];
            }

        }

        logger.info('unsubscribe:', 'total:', _.size(this.subscriptions.requests));

    }

}

module.exports = ContractPurchaseEvents;