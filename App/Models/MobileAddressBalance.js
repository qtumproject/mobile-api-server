const mongoose = require('mongoose');

const mobileAddressBalanceSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        index: {unique: true}
    },
    tokens: {
        type: [{token: String, language: String}],
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const MobileAddressBalance = mongoose.model('MobileAddressBalance', mobileAddressBalanceSchema);

module.exports = MobileAddressBalance;