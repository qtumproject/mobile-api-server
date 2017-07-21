const mongoose = require('mongoose');
const statuses = {
    FINISHED: 'finished',
    CONFIRMED: 'confirmed',
    WAIT_CONFIRM: 'wait_confirm',
    PENDING: 'pending'
};

const contractPurchaseSchema = new mongoose.Schema({
    contract_id: {
        type: String,
        required: true
    },
    request_id: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [statuses.FINISHED, statuses.CONFIRMED, statuses.WAIT_CONFIRM, statuses.PENDING]
    },
    from_addresses: {
        type: Array,
        index: true
    },
    payed_at: {
        type: Date,
        default: null,
        index: true
    },
    nonce: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const ContractPurchase = mongoose.model('ContractPurchase', contractPurchaseSchema);

ContractPurchase.STATUSES = statuses;

module.exports = ContractPurchase;