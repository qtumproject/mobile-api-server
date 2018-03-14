const mongoose = require('mongoose');

const unconfirmedBalanceSchema = new mongoose.Schema({
    block_height: {
        type: Number,
        required: true,
    },
    addresses: {
        type: [String],
        required: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

unconfirmedBalanceSchema.index({ token_id: 1, contract_address: 1}, { unique: true });

const UnconfirmedBalance = mongoose.model('UnconfirmedBalance', unconfirmedBalanceSchema);

module.exports = UnconfirmedBalance;