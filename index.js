const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const { v4: uuidv4 } = require('uuid');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors())

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


let users = [];
let exercises = [];


let userIdCount = 0;
function generateUserId() {
  userIdCount += 1;
  return userIdCount;
}


app.post('/api/users', (req, res) => {
  const username = req.body.username;
  console.log(username)
  const newUser = {
    username: username,
    _id: generateUserId() 
  };
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  const userList = users.map(user => {
    return { username: user.username, _id:String(user._id) };
});
  res.json(userList);
});


app.post('/api/users/:_id/exercises', (req, res) => {
  let { description, duration, date } = req.body;
  const _id = parseInt(req.params._id);
  const user = users.find(u => u._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  date = date ? new Date(date).toDateString() : new Date().toDateString();
  duration = parseInt(duration);

  const newExercise = { description, duration, date };
  exercises.push({ userId: _id, ...newExercise });

  res.json({
    username: user.username,
    description,
    duration,
    date,
    _id: user._id
  });
});

// GET a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const _id = parseInt(req.params._id);
  const user = users.find(u => u._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { from, to, limit } = req.query;
  let log = exercises
    .filter(ex => ex.userId === _id)
    .map(({ description, duration, date }) => ({
      description,
      duration,
      date
    }));

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(ex => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, +limit);
  }

  const response = {
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  };

  res.json(response);
});








const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
