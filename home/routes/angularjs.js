
var crequest = require("../lib/cached_request");
var nconf = require('nconf');

exports.angularjs = function(req, res) {
	var config = nconf.get('config');	
	var headerUrl = config.header.url;
	var notificationUrl = config.header.notificationUrl;	
	var requestUrl = headerUrl+"?selection=angularjs";
	var ioOrigin = config.ioOrigin;	
	var oauth2Proxy = config.oauth2Proxy;	

    crequest.get(requestUrl, req.user, function (err, body) {
        res.render('angularjs', { title: 'About - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl,
        	   	notificationUrl: notificationUrl,
        	   	ioOrigin: ioOrigin,
        	   	oauth2Proxy: oauth2Proxy,
        	   	user: req.user });		
    });
};