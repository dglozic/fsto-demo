
var crequest = require("../lib/cached_request");
var nconf = require('nconf');

exports.get = function(req, res) {
	var config = nconf.get('config');
	var headerUrl = config.header.url;
	var notificationUrl = config.header.notificationUrl;
	var requestUrl = headerUrl+"?selection=angularjs";
	var ioOrigin = config.ioOrigin;	
	var oauth2Proxy = config.oauth2Proxy;
	
	var selection = "view1";
	if (req.path=="/angular-seed/view2/")
		selection = "view2";

    crequest.get(requestUrl, req.user, function (err, body) {
    	res.render('angular_seed', { title: 'Angular Seed - FSTO Demo', header: body, selection: selection,
        	   	headerUrl: headerUrl, notificationUrl: notificationUrl, user: req.user,
        	   	oauth2Proxy: oauth2Proxy,
        	   	ioOrigin: ioOrigin });
    });
};