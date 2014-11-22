
var crequest = require("../lib/cached_request");
var nconf = require('nconf');

exports.index = function(req, res) {
	var config = nconf.get('config');
	var headerUrl = config.header.url;
	var notificationUrl = config.header.notificationUrl;
	var requestUrl = headerUrl+"?selection=home";
	var ioOrigin = config.ioOrigin;	
	var oauth2Proxy = config.oauth2Proxy;	

    crequest.get(requestUrl, req.user, function (err, body) {
    	if (req.user)
           res.render('my_home', { title: 'My Home - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl, notificationUrl: notificationUrl, ioOrigin: ioOrigin, 
        	   	oauth2Proxy: oauth2Proxy, user: req.user });
    	else
           res.render('index', { title: 'Home - FSTO Demo', header: body,
        	   	headerUrl: headerUrl, notificationUrl: notificationUrl,
        	   	ioOrigin: ioOrigin, oauth2Proxy: oauth2Proxy });    		
    });
};