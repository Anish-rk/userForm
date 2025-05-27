
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; 
const dbName = 'anishcodb';

let dbClient;
let db;

async function connectDB() {
  if (db) return db;

  dbClient = new MongoClient(uri, { useUnifiedTopology: true });
  await dbClient.connect();
  console.log('Connected to MongoDB');

  db = dbClient.db(dbName); 
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB first.');
  return db;
}

function closeDB() {
  if (dbClient) {
    dbClient.close();
  }
}

module.exports = { connectDB, getDB, closeDB };


