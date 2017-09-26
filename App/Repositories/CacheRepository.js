const Cache = require('../Models/Cache');

class CacheRepository {

    /**
     *
     * @param {String} type
     * @param {Function} next
     * @return {*}
     */
    createIfNotExistsAndFetchVersion(type, next) {

        return Cache.findOneAndUpdate({type}, {
            type
        }, {upsert: true, new: true}, (err, cache) => {
            return next(err, cache);
        });

    }

}


module.exports = CacheRepository;