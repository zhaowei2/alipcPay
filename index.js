const express = require('express');
const app = express();
const path = require('path')
var router = express.Router();
var Alipay = require('./alipay');
var utl = require('./utl')
app.set('views','views')
app.set('view engine','pug')

app.use(express.static(path.join(__dirname, 'static')));

var outTradeId = Date.now().toString();

var ali = new Alipay({
  appId: '2016101000654917',
  notifyUrl: 'http://127.0.0.1:3000/',
  rsaPrivate: path.resolve('./public/privatekey.pem'),
  rsaPublic: path.resolve('./public/publickey.pem'),
  sandbox: true,
  signType: 'RSA2'
});

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index');
});


app.get('/pay', function(req, res, next) {
  var ordeId = new Date().getDate()+4
  var url=  ali.webPay({
      body: "ttt",
      subject: "ttt1",
      outTradeId: ordeId,
      timeout: '90m',
      amount: "0.1",
      sellerId: '',
      product_code: 'FAST_INSTANT_TRADE_PAY',
      goods_type: "1",
      return_url:"http://127.0.0.1:3000/",
  })
  console.log()
  var url_API = 'https://openapi.alipaydev.com/gateway.do?'+url
  // var url_API = 'https://openapi.alipay.com/gateway.do?'+url;
  res.json({url:url_API})
});
app.listen(3000)
