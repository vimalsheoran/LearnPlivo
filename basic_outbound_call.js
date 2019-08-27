const Plivo = require("plivo");
const AUTH_ID = process.env.AUTH_ID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const MESSAGE_STRING = "Hi, this thing is working.";
const CALL_TO = "918320915417";
const CALL_FROM = "9191919191";
const ANSWER_URL = "https://s3.amazonaws.com/static.plivo.com/answer.xml";

const client = new Plivo.Client(AUTH_ID, AUTH_TOKEN);

let callOptions = {
	"answerMethod": "GET"
};

client.calls.create(CALL_FROM, CALL_TO, ANSWER_URL, callOptions).then(call_created => console.log(call_created));
client.messages.create(CALL_FROM, CALL_TO, MESSAGE_STRING).then(msg_created => console.log(msg_created));