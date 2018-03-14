const mongoose = require('mongoose');

const unconfirmedBalanceSchema = new mongoose.Schema({
    block_height: {
        type: Number,
        required: true,
        index: { unique: true },
    },
    addresses: {
        type: [String],
        required: true,
    },
}, {
    timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const UnconfirmedBalance = mongoose.model('UnconfirmedBalance', unconfirmedBalanceSchema);

module.exports = UnconfirmedBalance;