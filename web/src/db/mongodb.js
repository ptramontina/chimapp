const MongoClient = require( 'mongodb' ).MongoClient;
const url = 'mongodb://127.0.0.1:27017/chimapp-api';

let mongodb;

function connect(callback) {
    MongoClient.connect(url, (err, db) => {
        mongodb = db;
        callback();
    });
}
function get() {
    return mongodb;
}

function close() {
    mongodb.close();
}

module.exports = {
    connect,
    get,
    close
};