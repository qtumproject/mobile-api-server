const mongoose = require('mongoose');

const contractDownloadSchema = new mongoose.Schema({
    contract_id: {
        type: String,
        required: true
    },
    request_id: {
        type: String,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const ContractDownload = mongoose.model('ContractDownload', contractDownloadSchema);

module.exports = ContractDownload;