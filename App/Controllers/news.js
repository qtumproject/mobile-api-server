let async = require('async'),
    logger = require('log4js').getLogger('News Controller');

let Controllers = getControllers();

class NewsController {

    constructor() {
        logger.info('Init');
    }

    getNews(cb) {
        return cb(null, []);
    }
}

Controllers.news = new NewsController();