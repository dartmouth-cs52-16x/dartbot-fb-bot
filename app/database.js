import { MongoClient } from 'mongodb';

const URL = process.env.MONGODB_URI;


export function setupMongo() {
  MongoClient.connect(URL, (err, db) => {
    if (err) {
      console.log(err);
      return null;
    } else {
      console.log('Connected to server');
      return findDDSDailies(db);
    }
  });
}
export function findDDSDailies(db) {
  const dailies = db.collection('ddsdailies');
  dailies.findOne({}, (err, doc) => {
    return doc;
  });
}
