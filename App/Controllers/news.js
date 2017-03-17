let async = require('async'),
    logger = require('log4js').getLogger('News Controller');


class NewsController {

    constructor() {
        logger.info('Init');
    }

    getNews(cb) {
        return cb(null, []);
    }
}

module.exports = NewsController;