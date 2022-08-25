process.env.TZ = 'America/Bogota' 

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookie = require('cookie-parser');
const passport = require('passport');
// const argv = require('optimist').argv;
require('./middleware/passport');

const { port, hostname, secretSession } = require('./config');
const { connect } = require('./config/database');

console.log(new Date().toString());


const app = express();


connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: ['https://libel.jceballos.com.co', 'http://libel.jceballos.com.co', 'http://localhost:3000', 'http://localhost:3001', 'http://libel.jceballos.com.co:3000', 'https://plataforma.libel.academy'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(cookie())
app.use(
  session({
    secret: secretSession,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());


app.use('/v2', require('./routes'));


app.get('/', (req, res) => {
  res.json({
    name: 'libel-course-app',
    version: '2.0.1',
  });
});


app.listen(port, () => {
  console.log(`Server: ${hostname}`);
});