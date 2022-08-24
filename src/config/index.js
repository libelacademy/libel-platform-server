/** @format */

require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  hostname: process.env.HOSTNAME || 'http://localhost:5000',
  version: process.env.VERSION || 'v1',
  frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  production: process.env.NODE_ENV === 'production',
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/libel',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
  saltRounds: Number.parseInt(process.env.SALT_ROUNDS) || 10,
  secretSession: process.env.SESSION_SECRET || 'secret',
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    projectId: process.env.GOOGLE_PROJECT_ID || '',
    bucketName: process.env.GOOGLE_BUCKET_NAME || '',
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
  },
  emailer: {
    host: process.env.EMAILER_HOST,
    port: process.env.EMAILER_PORT,
    secure: process.env.EMAILER_SECURE,
    auth: {
      user: process.env.EMAILER_USER,
      pass: process.env.EMAILER_PASS,
    },
  },
  paypal: {
    clientID: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_SECRET,
    api: process.env.PAYPAL_API,
  },
  ePayco: {
    publicKey: process.env.EPAYCO_PUBLIC_KEY || '',
    secretKey: process.env.EPAYCO_PRIVATE_KEY || '',
    api: process.env.EPAYCO_API || '',
  },
};

module.exports = config;
