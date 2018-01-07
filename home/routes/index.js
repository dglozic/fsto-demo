
var crequest = require("../lib/cached_request");
var nconf = require('nconf');

exports.index = function(req, res) {
	var config = nconf.get('config');
	var headerUrl = config.header.url;
	var notificationUrl = config.header.notificationUrl;
	var requestUrl = headerUrl+"?selection=home";
	var ioOrigin = config.ioOrigin;	
	var oauth2Proxy = config.oauth2Proxy;
    var k8s = process.env.K8S === "true";

    crequest.get(requestUrl, req.user, function (err, body) {
    	if (req.user) {
            console.log("USER: " + JSON.stringify(req.user));
           res.render('my_home', { title: 'My Home - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl, notificationUrl: notificationUrl, ioOrigin: ioOrigin, 
        	   	oauth2Proxy: oauth2Proxy, user: req.user, k8s });
        }
    	else
           res.render('index', { title: 'Home - FSTO Demo', header: body,
        	   	headerUrl: headerUrl, notificationUrl: notificationUrl,
        	   	ioOrigin: ioOrigin, oauth2Proxy: oauth2Proxy, k8s });    		
    });
};