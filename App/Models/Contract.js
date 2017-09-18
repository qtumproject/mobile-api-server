const mongoose = require('mongoose');

const contractSchemaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true,
        index: true
    },
    size: {
        type: Number,
        required: true
    },
    completed_on: {
        type: String,
        required: true
    },
    with_source_code: {
        type: Boolean,
        required: true
    },
    publisher_address: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["Smart Contract", "Crowdsale", "QRC20 Token"]
    },
    price: {
        type: String,
        required: true
    },
    count_buy: {
        type: Number,
        required: true
    },
    count_downloads: {
        type: Number,
        required: true
    },
    source_code: {
        type: String,
    },
    bytecode: {
        type: String,
    },
    abi: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Contract = mongoose.model('Contract', contractSchemaSchema);

module.exports = Contract;