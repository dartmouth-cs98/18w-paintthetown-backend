import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRouter from './router';

// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/paint-the-town';
// const mongoURI = 'mongodb://localhost/paint-the-town';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// initialize
const app = express();
const logFunc = console.log;

console.log = (...s) => {
  const date = new Date();
  // let s = t;
  s.forEach(x => {
    logFunc(`\x1b[36m${date.toLocaleString()}:\x1b[0m ${x}`);
  });
};

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.enable('trust proxy');

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
apiRouter.route('/').get((req, res) => { res.json({ msg: 'Hello world!' }); });
app.use('/api', apiRouter);

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
