
var crequest = require("../lib/cached_request");
var nconf = require('nconf');
var model = require('../models/todos');

exports.get = function(req, res) {
	var config = nconf.get('config');
	var headerUrl = config.header.url;
	var notificationUrl = config.header.notificationUrl;
	var requestUrl = headerUrl+"?selection=isomorphic";
	var ioOrigin = config.ioOrigin;	
	var oauth2Proxy = config.oauth2Proxy;

    crequest.get(requestUrl, req.user, function (err, body) {
    	model.list(req.user, function(err, todos) { 
    		res.render('isomorphic', { title: 'Isomorphic - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl, notificationUrl: notificationUrl, user: req.user,
        	   	oauth2Proxy: oauth2Proxy,
        	   	ioOrigin: ioOrigin, todos: todos });
    	});
    });
};