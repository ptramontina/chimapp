// const MongoClient = require('mongodb').MongoClient;  
// const assert = require('assert');

// // This is a global variable we'll use for handing the MongoDB client
// let mongodb;

// // Connection URL
// let url = 'mongodb://127.0.0.1:27017/chimapp-api';

// // Create the db connection
// MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {  
//         assert.equal(null, err);
//         this.mongodb = db;
//         console.log('iii')
//         console.log(this.mongodb)
//     }
// );

// module.exports = mongodb;


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