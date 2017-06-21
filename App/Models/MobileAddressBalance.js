const mongoose = require('mongoose');

const mobileAddressBalanceSchema = new mongoose.Schema({
    token_id: {
        type: String,
        required: true
    },
    addresses: {
        type: [{address: String, balance: Number}],
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mobileAddressBalanceSchema.index({ token_id: 1}, { unique: true });

const MobileAddressBalance = mongoose.model('MobileAddressBalance', mobileAddressBalanceSchema);

module.exports = MobileAddressBalance;