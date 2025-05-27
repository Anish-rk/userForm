// server.js
const express = require('express');
const path = require('path');
const { connectDB, getDB } = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.redirect('/list'));
app.get('/list', (req, res) => res.sendFile(path.join(__dirname, 'public', 'list.html')));
app.get('/form', (req, res) => res.sendFile(path.join(__dirname, 'public', 'form.html')));

const COLLECTION_NAME = 'userinfo';


connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });


app.post('/api/submit', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION_NAME);
    const userData = req.body;

    if (userData.id) {
     
      const id = parseInt(userData.id, 10);
     
      const { id: _, ...updateData } = userData;

      const result = await collection.updateOne(
        { id },
        { $set: updateData },
        { upsert: true }
      );
      return res.json({ message: 'User updated successfully!' });
    } else {
      const maxUser = await collection.find().sort({ id: -1 }).limit(1).toArray();
      const newId = maxUser.length > 0 ? maxUser[0].id + 1 : 1;
      userData.id = newId;

      await collection.insertOne(userData);
      return res.json({ message: 'User added successfully!' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save user data' });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION_NAME);
    const users = await collection.find().toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION_NAME);
    const id = parseInt(req.params.id, 10);
    const user = await collection.findOne({ id });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load user' });
  }
});