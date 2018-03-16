const mongoose = require('mongoose');

const coinStackSchema = new mongoose.Schema({
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
		updatedAt: 'updated_at',
	},
});

const CoinStack = mongoose.model('CoinStack', coinStackSchema);

module.exports = CoinStack;
