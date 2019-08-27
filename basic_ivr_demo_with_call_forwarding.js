let plivo = require('plivo');
let express = require('express');
let bodyParser = require('body-parser');
let app = express();

const FORWARDING_NUMBER = "918320915417";

app.use(bodyParser.urlencoded({extended: true}));
app.set('port', (process.env.PORT || 5000));

// This is the message that Plivo reads when the caller dials in
let PRE_RECORDED = "Hi, sorry for the inconvenience, our executive will get back to you as soon as possible.";
let IVR_MESSAGE1 = "Welcome to my helpdesk. Press 1 to speak to an executive. Press 2 to listen to a recording.";
let NO_INPUT_MESSAGE = "Sorry, I didn't catch that. Please hangup and try again later.";
let WRONG_INPUT_MESSAGE = "Sorry, you've entered an invalid input.";

app.get('/response/ivr/', function(request, response) {
  let r = plivo.Response();
  let getdigits_action_url, params, getDigits;
  action_url = request.protocol + '://' + request.headers.host + '/response/ivr/';
  params = {
    'action': action_url,
    'method': 'POST',
    'timeout': '7',
    'numDigits': '1',
    'retries': '1'
  };
  getDigits = r.addGetDigits(params);
  getDigits.addSpeak(IVR_MESSAGE1);
  r.addSpeak(NO_INPUT_MESSAGE);

  console.log(r.toXML());
  response.set({'Content-Type': 'text/xml'});
  response.send(r.toXML());
});

app.post('/response/ivr/', function(request, response) {
  let r = plivo.Response();
  let digit = request.body.Digits;
  if (digit === '1') {
    let fromNumber = request.body.From || request.query.From;
    let params = {
      "callerId": fromNumber
    };
    let d = r.addDial(params);
    d.addNumber(FORWARDING_NUMBER);
  } else if (digit === '2') {
    r.addSpeak(PRE_RECORDED);
  } else {
    r.addSpeak(WRONG_INPUT_MESSAGE);
  }

  console.log(r.toXML());
  response.set({'Content-Type': 'text/xml'});
  response.send(r.toXML());
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});