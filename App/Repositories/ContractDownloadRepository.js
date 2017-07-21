const ContractDownload = require('../Models/ContractDownload');
class ContractDownloadRepository {

    /**
     *
     * @param {String} contractId
     * @param {String} requestId
     * @param {Function} next
     * @return {*}
     */
    static createDownload(contractId, requestId, next) {
        return ContractDownload.create({
            contract_id: contractId,
            request_id: requestId
        }, (err, download) => {
            return next(err, download);
        });
    }

}

module.exports = ContractDownloadRepository;