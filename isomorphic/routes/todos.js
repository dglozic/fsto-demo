
var crequest = require("../lib/cached_request");
var nconf = require('nconf');
var model = require('../models/todos');

exports.get = function(req, res) {
	model.list(req.user, function (err, todos) {
		res.write(JSON.stringify(todos));
		res.sendStatus(200);
		res.end();
	});
};

exports.post = function(req, res) {
   var body = req.body;
   
   model.add(req.user, body.text, function (err, todo) {
	   res.sendStatus(201);
	   res.end();
	   _pushEvent("add", req.user, todo);
   });
};

exports.delete = function(req, res) {
	model.deleteAll(req.user, function(err) {
		res.sendStatus(204);
		res.end();
		_pushEvent("delete", req.user, {});
	});
};

function _pushEvent(type, user, object) {
	var restrictedUser = {
			id: user.id,
			name: user.displayName
	};
	var message = {
		type: type,
		state: object,
		user: restrictedUser
	};
	exports.exchange.publish("todos", JSON.stringify(message));
}