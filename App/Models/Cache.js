const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Cache = mongoose.model('Cache', CacheSchema);

Cache.TYPES = {};
Cache.TYPES.CONTRACT_TYPES = 'CONTRACT_TYPES';

module.exports = Cache;