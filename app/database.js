import { MongoClient } from 'mongodb';

const URL = process.env.MONGODB_URI;


function setupMongo(callback) {
  MongoClient.connect(URL, (err, db) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Connected to server');
      callback(db);
    }
  });
}
export function findDDSDailies(callback) {
  setupMongo((db) => {
    const dailies = db.collection('ddsdailies');
    dailies.findOne({}, callback);
  });
}
