const util = require("util");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Plivo = require("plivo");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT;
const AUTH_ID = process.env.AUTH_ID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const MESSAGE = "Hi, our executive is unavailable to take your call, sorry for the inconvenience. Press 1 to record a message and our executive will get back to you.";

let TempCache = {};

app.use(bodyParser.urlencoded({extended: true}));
const mailClient = nodemailer.createTransport({
	"host": "smtp.mailtrap.io",
	"port": 2525,
	"auth": {
		"user": "2358225424d027",
		"pass": "c4d999608eec5f"
	}
});

const notifyDesk = (audioUrl, transcription) => {
	
	const message = {
		"from": "support@superawesomeservice.com",
		"to": "vimal@callhippo.com",
		"subject": "Missed Call | Your customers are waiting.",
		"text": `Hi Vimal, you have missed a client call, please check the audio url and the transcript below. \nAudio URL: ${audioUrl} \nTranscript: ${transcription}`
	};

	mailClient.sendMail(message, (err, info) => {
		if (err) console.log(err);
		else console.log(info);
	});
}

app.all("/record_api/", (req, res) => {
	let actionUrl = util.format("http://%s/record_api_action/", req.get("host"));
	let params = {
		"action": actionUrl,
		"method": "GET",
		"timeout": "7",
		"numDigits": "1",
		"retries": "1",
		"redirect": "false"
	};

	let response = Plivo.Response();
	let digits = response.addGetDigits(params);
	digits.addSpeak(MESSAGE);

	let delay = {
		"length": "120"
	};
	response.addWait(delay);

	console.log(response.toXML());
	res.set({"Content-Type": "text/xml"});
	res.send(response.toXML());
});

app.all("/record_api_action/", async (req, res) => {
	let digit = req.param("Digits");
	let callUUID = req.param("CallUUID");

	let client = new Plivo.Client(AUTH_ID, AUTH_TOKEN);

	if (digit == "1") {
		let transcriptURL = util.format("http://%s/recording_transcript", req.get("host"));
		let params = {
			"transcription_url": transcriptURL
		};
		let response = await client.calls.record(callUUID, params);
		TempCache[response.recordingId] = {};
		TempCache[response.recordingId]["audio_url"] = response.url;
	} else {
		console.log("Wrong Input.");
	}
	res.end();
});

app.all("/recording_transcript", (req, res) => {
	let callRecordingId = req.body.recording_id;
	let transcription = req.body.transcription;
	let audioUrl = TempCache[callRecordingId]["audio_url"];
	console.log(transcription);
	console.log(TempCache[callRecordingId]["audio_url"]);
	notifyDesk(audioUrl, transcription);
	res.end();
});

app.listen(PORT, () => console.log("Server running on: ", PORT));