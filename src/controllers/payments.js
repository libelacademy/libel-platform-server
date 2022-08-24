/** @format */

const { Course, Student, Order } = require('../models');
// const paypal = require('paypal-rest-sdk');
const request = require('request');
const {
  paypal,
  ePayco,
  hostname,
  version,
  frontend,
} = require('../config');
// const base64 = require('base-64');
const { default: axios } = require('axios');

// paypal.configure({
//   "mode": 'sandbox', //sandbox or live
//   "client_id": paypalClientId,
//   "client_secret": paypalSecret,
// });

const authPaypal = {
  user: paypal.clientID,
  pass: paypal.clientSecret,
};

// const authEpayco = base64.encode(
//   `${ePaycoPublicKey}:${ePaycoSecretKey}`
// );

const createPaypalPayment = async (req, res) => {
  const { courseId, coursePrice, courseName } = req.body;
  const { id } = req.user;
  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: coursePrice,
        },
      },
    ],
    application_context: {
      brand_name: courseName,
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      description: courseName,
      return_url: `${hostname}/${version}/payments/paypal/${courseId}/execute-payment/${id}`,
      cancel_url: `${hostname}/${version}/payments/cancel-payment/${courseId}`,
    },
  };

  // request.post(
  //   `${paypal.apipi}/v2/checkout/orders`,
  //   {
  //     auth: authPaypal,
  //     body,
  //     json: true,
  //   },
  //   (err, response) => {
  //     console.log(response);
  //     // const url = response.body.links.find(
  //     //   (link) => link.rel === 'approve'
  //     // ).href;
  //     const url = true
  //     res.json({ data: url });
  //   }
  // );

  try {
    const response = await axios.post(
      `${paypal.api}/v2/checkout/orders`,
      body,
      {
        auth: {
          username: paypal.clientID,
          password: paypal.clientSecret,
        },
        json: true,
      }
    );
    const url = response.data.links.find(
      (link) => link.rel === 'approve'
    ).href;
    res.json({ data: url });
  } catch (error) {
    console.log(error.response.data);
  }
};

const executePaypalPayment = async (req, res) => {
  const token = req.query.token;
  const { courseId, userId } = req.params;
  request.post(
    `${paypal.api}/v2/checkout/orders/${token}/capture`,
    {
      auth: authPaypal,
      body: {},
      json: true,
    },
    async (err, response) => {
      const course = await Course.findById(courseId);
      const student = await Student.findOne({ user: userId });
      student.enrollments.push({
        course: courseId,
        status: course.published ? 'process' : 'pending',
      });
      await student.save();
      course.students.push(student._id);
      await course.save();
      const order = new Order({
        order_id: response.body.id,
        student: student._id,
        course: course._id,
        payment_method: 'PayPal',
        payment_status: response.body.status,
        payer: userId,
      });
      await order.save();
      res.redirect(`${frontend}/compra-exitosa/${order._id}`);
    }
  );
};

const createEpaycoPayment = async (req, res) => {
  const { courseId, coursePrice, courseName } = req.body;
  const { id } = req.user;

  try {
    const body = {
      quantity: 1,
      onePayment: true,
      amount: coursePrice,
      currency: 'USD',
      id: 0,
      base: '0',
      description: courseName,
      title: courseName,
      typeSell: '1',
      tax: '0',
      email: 'jacu29@gmail.com',
      onePayment: true,
      urlResponse: `${hostname}/${version}/payments/epayco/${courseId}/execute-payment/${id}`,
      methodConfirmation: 'get',
    };

    const { data: loginResponse } = await axios.post(
      `${ePayco.api}/login`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: ePayco.publicKey,
          password: ePayco.secretKey,
        },
      }
    );

    const { data: response } = await axios.post(
      `${ePayco.api}/collection/link/create`,
      body,
      {
        headers: {
          Authorization: `Bearer ${loginResponse.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ data: response.data.routeLink });
  } catch (error) {
    res.json({ data: error.response.data });
  }
};

const executeEpaycoPayment = async (req, res) => {

  const { courseId, userId } = req.params;
  const { ref_payco } = req.query;

  const course = await Course.findById(courseId);
  const student = await Student.findOne({ user: userId });

  try {
    const { data: response } = await axios.get(
      `https://secure.epayco.co/validation/v1/reference/${ref_payco}`
    );
    const { x_transaction_state, x_id_factura } = response.data;
    if (x_transaction_state === 'Aceptada') {
      student.enrollments.push({
        course: courseId,
        status: course.published ? 'process' : 'pending',
      });
      await student.save();
      course.students.push(student.user);
      await course.save();
      const order = new Order({
        order_id: x_id_factura,
        student: student._id,
        course: course._id,
        payment_method: 'ePayco',
        payment_status: x_transaction_state,
        payer: userId,
      });
      await order.save();
      res.redirect(`${frontend}/compra-exitosa/${order._id}`);
    } else {
      res.redirect(`${frontend}/cursos/${course.slug}`);
    }
  } catch (error) {
    res.redirect(`${frontend}/cursos/${course.slug}`);
  }


  // const courseId = req.params.courseId;
  // const userId = req.params.userId;
  // const course = await Course.findById(courseId);
  // const student = await Student.findOne({ user: userId });

  // if (x_transaction_state === 'Aceptada') {
  //   student.enrollments.push({
  //     course: courseId,
  //   });
  //   await student.save();
  //   course.students.push(student.user);
  //   await course.save();
  //   const order = new Order({
  //     student: student._id,
  //     course: course._id,
  //     paymentMethod: 'ePayco',
  //     payer: userId,
  //   });
  //   await order.save();
  //   res.redirect(`${frontend}/compra-exitosa/${order._id}`);
  // } else {
  //   res.redirect(`${frontend}/cursos/${course.slug}`);
  // }
};

const cancelPayment = async (req, res) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  res.redirect(`${frontend}/cursos/${course.slug}`);
};

module.exports = {
  createPaypalPayment,
  executePaypalPayment,
  createEpaycoPayment,
  executeEpaycoPayment,
  cancelPayment,
};
