const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AX8C-G3TmThfMKOwg5wcpSUVA7aW4KHsz_djqIoaxn9dVCG21HesN4fo_xVtwYcYfSITnDLZBIVtmZfL',
    'client_secret': 'ENHHgoHywNvOYdMh5k9vESgLC7uWxNgFIQJy2Foekl9GoD6oHxvAscQCSQKo7bKsMmJ5sCMxWOotPCeI'
  });


const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat", //add variables 
                "sku": "001",
                "price": "25.00",
                "currency": "INR",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "INR",
            "total": "25.00"
        },
        "description": "{% %}"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});

app.get('/success', (req, res) => {

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  console.log("Hey") ;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "INR",
            "total": "25.00" 
            // add as a variable 
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        //alert("Payment was successful") ;
        res.send('Success');
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));