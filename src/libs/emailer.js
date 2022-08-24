const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { emailer, frontend } = require('../config');

const transporter = nodemailer.createTransport({
  host: emailer.host,
  port: emailer.port,
  secure: true,
  auth: {
    user: emailer.auth.user,
    pass: emailer.auth.pass,
  },
});

transporter.use('compile', hbs({
  viewEngine: {
    extName: '.hbs',
    defaultLayout: false,
  },
  viewPath: path.resolve('src/templates'),
  extName: '.hbs',
}));


const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: '"Libel Academy" <info@libel.academy >',
    to: `${user.email}`,
    subject: 'Bienvenid(a) a Libel Academy',
    text: `Hola ${user.name}, nos alegra que te hayas unido a nuestra comunidad y decidieras comenzar este camino en el mundo del diseño 3D. `,
    template: 'welcome',
    context: {
      name: user.name,
      year: new Date().getFullYear(),
    }
  }

  await transporter.sendMail(mailOptions);

  return
}

const sendCreatedUserEmail = async (user) => {
  const mailOptions = {
    from: '"Libel Academy" <info@libel.academy >',
    to: `${user.email}`,
    subject: 'Bienvenid(a) a Libel Academy',
    text: `Hola ${user.name}, nos alegra que te hayas unido a nuestra comunidad y decidieras comenzar este camino en el mundo del diseño 3D.`,
    template: 'createdUser',
    context: {
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password,
      year: new Date().getFullYear(),
    }
  }

  await transporter.sendMail(mailOptions);

  return
}


const sendPasswordResetEmail = async (user, token) => {
  const mailOptions = {
    from: '"Libel Academy" <info@libel.academy>',
    to: `${user.email}`,
    subject: 'Restablecer contraseña',
    text: `Hola ${user.name}, para restablecer tu contraseña, haz click en el siguiente enlace: ${frontend}/restablecer/${token}`,
    template: 'passwordReset',
    context: {
      name: user.name,
      token,
      frontend,
      year: new Date().getFullYear(),
    }
  }

  const info = await transporter.sendMail(mailOptions);
  return info.messageId;
}

const sendChangePassword = async (user) => {
  const mailOptions = {
    from: '"Libel Academy" <info@libel.academy>',
    to: `${user.email}`,
    subject: 'Cambio de contraseña',
    text: `Hola ${user.name},te informamos que se realizó una cambio a tu contraseña.`,
    template: 'changaPassword',
    context: {
      name: user.name,
      year: new Date().getFullYear(),
    }
  }

  const info = await transporter.sendMail(mailOptions);
  return info.messageId;
}

const sendStartCourseInfo = async (user) => {
  const mailOptions = {
    from: '"Libel Academy" <info@libel.academy>',
    to: `${user.email}`,
    subject: 'Inicio de curso',
    text: `Hola ${user.name}, te informamos que el curso ${user.course} ya se encuentra activo, puedes empezar cuando quieras.`,
    template: 'startCourse',
    context: {
      name: user.name,
      course: user.course,
      slug: user.slug,
      frontend,
      year: new Date().getFullYear(),
    }
  }

  const info = await transporter.sendMail(mailOptions);
  console.log('Sent Message: ', info.messageId);
  return info.messageId;
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendCreatedUserEmail,
  sendChangePassword,
  sendStartCourseInfo,
}