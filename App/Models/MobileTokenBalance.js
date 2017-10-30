const mongoose = require('mongoose');

const mobileTokenSchema = new mongoose.Schema({
    token_id: {
        type: String,
        required: true
    },
    contract_address: {
        type: String,
        required: true
    },
    addresses: {
        type: [{address: String, balance: String}],
        required: true
    },
    language: {
        type: String,
        required: true,
        default: 'en'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mobileTokenSchema.index({ token_id: 1, contract_address: 1}, { unique: true });

const MobileTokenBalance = mongoose.model('MobileTokenBalance', mobileTokenSchema);

module.exports = MobileTokenBalance;