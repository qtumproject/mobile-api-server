const mongoose = require('mongoose');
const bluebird = require('bluebird');

class DB {

    constructor(mongo_db_uri) {
        mongoose.Promise = bluebird;
        this.MONGO_DB_URI = mongo_db_uri;
    }

    connect(cb) {

        return mongoose.connect(this.MONGO_DB_URI, function(err) {

            if(err) {
                return cb(err);
            }

            return cb();
        });

    }
}

module.exports = DB;