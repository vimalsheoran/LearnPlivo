const plivo = require("plivo");
const express = require("express");
const bodyParser = require("body-parser");

const PORT = process.env.PORT;
const FORWARDING_NUMBER = "918320915417";

let app = express();

app.use(bodyParser.urlencoded({"extended": true}));

app.all("/forward/", (req, res) => {
	console.log("request comes here.");
	let r = plivo.Response();
	let fromNumber = req.body.From || req.query.From;
	let params = {
		"callerId": fromNumber
	};

	let d = r.addDial(params);
	d.addNumber(FORWARDING_NUMBER);
	console.log(r.toXML());

	res.set({"Content-Type": "text/xml"});
	res.send(r.toXML());
});

app.listen(PORT, "0.0.0.0", () => console.log("App running on: ", PORT));
