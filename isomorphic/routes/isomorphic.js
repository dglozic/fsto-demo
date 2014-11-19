
var crequest = require("../lib/cached_request");
var nconf = require('nconf');
var model = require('../models/todos');

exports.get = function(req, res) {
	var headerUrl = nconf.get('config').header.url;
	var requestUrl = headerUrl+"?selection=isomorphic";
	var ioOrigin = nconf.get('config').ioOrigin;	

    crequest.get(requestUrl, req.user, function (err, body) {
        res.render('isomorphic', { title: 'Isomorphic - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl, user: req.user, ioOrigin: ioOrigin, todos: model.list() });
     });
};

exports.post = function(req, res) {
   var body = req.body;
   
   model.add(req.user, body.text, function (err, todo) {
	   _pushEvent("add", todo);
   });
};

exports.delete = function(req, res) {
	model.deleteAll(function(err) {
		_pushEvent("deleteAll", {});
	});
}

function _pushEvent(topic, message) {
    exports.io.sockets.emit(topic, message);
}