const Cache = require('../Models/Cache');
const ContractsRepository = require('../Repositories/ContractsRepository');

class ContractsTypesService {

    /**
     *
     * @param {CacheRepository} cacheRepository
     */
    constructor(cacheRepository) {
        this.cacheRepository = cacheRepository;
        this.cacheVersion = null;
        this.types = [];
    }


    /**
     *
     * @param {Function} next
     * @return {*}
     */
    getTypes(next) {

        return this.cacheRepository.createIfNotExistsAndFetchVersion(Cache.TYPES.CONTRACT_TYPES, (err, cache) => {

            if (cache.version !== this.cacheVersion) {
                this.cacheVersion = cache.version;
                return ContractsRepository.fetchTypes((err, types) => {

                    if (err) {
                        return next(err)
                    }

                    this.types = types;

                    return next(null, types);

                })
            }

            return next(null, this.types);

        });

    }

}

module.exports = ContractsTypesService;