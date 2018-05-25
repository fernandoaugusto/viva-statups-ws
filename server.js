var express = require('express');
var request = require('request');
const querystring = require('querystring');
var validator = require("email-validator");
var app = express();
require('./config');
var {mongoose} = require('./mongoose');
var {Member} = require('./member.model');

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
    emailController.sendCouponEmail(req.query.event_coupon, req.query.event_name, req.query.event_url, req.query.email);        /*event_coupon, event_name, event_url, email_to*/

    var chatFuelMSG = {
      "messages": [
        {
          "text": `O email para ${req.query.email} foi enviado com sucesso!`
        },
        {
          "text": `Confira em instantes a sua Caixa de Entrada ou na Caixa de Spam.`
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












app.get('/requests', async (req, res) => {

  url = 'https://novo.org.br/app/Solicitacoes';

  var cities = [];
  var emails = [];
  if (req.query.cities && req.query.emails) {
    cities = req.query.cities.split(',');
    emails = req.query.emails;
  } else if (req.query.cities && !req.query.emails) {
    cities = req.query.cities.split(',');
    emails = '';
  } else {
    res.status(400).send('No parameters');
  }

  request(url, function(error, response, html) {
    var data;
    var members_raw = [];
    var members = [];
    if(!error) {
      var $ = cheerio.load(html);

      var name, city, elector_id;
      var json = [];

      $('#fbody').filter(function() {
        data = $(this).children().each(function(i, elem) {
          var content = $(this).contents().toString();
          if (!content.includes('<td></td>')) {
            members_raw[i] = $(this).contents().text().trim();
          }
        });
      })

      members_raw.forEach((member) => {
        var name_json = member.substring(0, member.search("\n"));
        var split1 = member.substring(member.search(name_json) + name_json.length, 1000).trim();
        var state_json = split1.substring(0, split1.search("\n"));
        var split2 = split1.substring(split1.search(state_json) + state_json.length, 1000).trim();
        var city_json = split2.substring(0, split2.search("\n")).trim();

        var split3 = split2.substring(split2.search(city_json) + city_json.length, 1000).trim();
        var id_elector_json = split3.substring(0, split3.search("\n")).trim();

        members.push({
            "name": name_json.trim(),
            "city": city_json.trim(),
            "state": state_json.trim(),
            "id_elector": id_elector_json.trim()
        });
      });
    }

    var local_members = [];
    members.forEach((member) => {
      if (cities.includes(member.city)) {
        const memberRecord = Member.findByIDElector(member.id_elector);
        memberRecord.then(() => {
          local_members.push(member);

          if (emails.length > 0) {
            try {
              emailController.sendEmail(local_members, emails);
              res.status(200).send(local_members);
            } catch(e) {
              console.log(e);
              res.status(400).send(e);
            }
          } else {
            /*fs.writeFile('output_content.json', JSON.stringify(members_raw), function(err){
              console.log('File successfully written! - Check your project directory for the output_content.json file');
            });*/
            res.status(200).send(local_members);
          }

        }).catch(() => {

          local_members.push(member);

          Member.createMember(member).then(() => {
            console.log('Inserted');

            if (emails.length > 0) {
              try {
                emailController.sendEmail(local_members, emails);
                res.status(200).send(local_members);
              } catch(e) {
                console.log(e);
                res.status(400).send(e);
              }
            } else {
              /*fs.writeFile('output_content.json', JSON.stringify(members_raw), function(err){
                console.log('File successfully written! - Check your project directory for the output_content.json file');
              });*/
              res.status(200).send(local_members);
            }

          }).catch((err) => {

            if (emails.length > 0) {
              try {
                emailController.sendEmail(local_members, emails);
                res.status(200).send(local_members);
              } catch(e) {
                console.log(e);
                res.status(400).send(e);
              }
            } else {
              /*fs.writeFile('output_content.json', JSON.stringify(members_raw), function(err){
                console.log('File successfully written! - Check your project directory for the output_content.json file');
              });*/
              res.status(200).send(local_members);
            }

            console.log('ERROR on insert', err.message);
          });
        });
      }
    });



  });
})

var port = process.env.PORT.toString() || '3000';
app.listen(port);
console.log(`Magic happens on port ${process.env.PORT}`);
module.exports = app;
