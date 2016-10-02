import { MongoClient } from 'mongodb';

const URL = process.env.MONGODB_URI;


export function setupMongo(test) {
  MongoClient.connect(URL, (err, db) => {
    if (err) {
      console.log(err);
      return null;
    } else {
      console.log('Connected to server');
      return findDDSDailies(db, test);
    }
  });
}
export function findDDSDailies(db, test) {
  const dailies = db.collection('ddsdailies');
  dailies.findOne({}, test);
}
