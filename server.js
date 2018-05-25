var express = require('express');
var request = require('request');
const querystring = require('querystring');
var validator = require("email-validator");
var app = express();
require('./config');

var emailController  = require('./email');



app.post('/sendEmailChatFuel', async (req, res) => {


  if (!req.query.email || !req.query.event_coupon || !req.query.event_name || !req.query.event_url) {
    var chatFuelMSG = {
      "messages": [
        {
          "text": `Seu e-mail não foi enviado. Favor conferir o endereço informado e reenviar.`
        }
      ],
      "redirect_to_blocks": [req.query.event_coupon]
    }
    res.status(400).send(chatFuelMSG);
  }

  if (!validator.validate(req.query.email)) {
    var chatFuelMSG = {
      "messages": [
        {
          "text": `Seu e-mail não foi enviado. Favor conferir o endereço informado e reenviar.`
        }
      ],
      "redirect_to_blocks": [req.query.event_coupon]
    }
    res.status(400).send(chatFuelMSG);
  }

  try {
    emailController.sendCouponEmail(req.query.text_template ,req.query.event_coupon, req.query.event_name, req.query.event_url, req.query.email);        /*event_coupon, event_name, event_url, email_to*/

    var chatFuelMSG = {
      "messages": [
        {
          "text": `O email para ${req.query.email} foi enviado com sucesso!`
        },
        {
          "text": `Confira em instantes a sua Caixa de Entrada ou Spam.`
        }
      ]
    }

    res.status(200).send(chatFuelMSG);
  } catch(e) {
    var chatFuelMSG = {
      "messages": [
        {
          "text": `Seu e-mail não foi enviado. Favor conferir o endereço informado e reenviar.`
        }
      ],
      "redirect_to_blocks": [req.query.event_coupon]
    }
    res.status(400).send(chatFuelMSG);
  }

});


var port = process.env.PORT.toString() || '3000';
app.listen(port);
console.log(`Magic happens on port ${process.env.PORT}`);
module.exports = app;
