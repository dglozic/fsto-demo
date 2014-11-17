
var crequest = require("../lib/cached_request");
var nconf = require('nconf');

exports.index = function(req, res) {
	var headerUrl = nconf.get('config').header.url;
	var requestUrl = headerUrl+"?selection=home";

    crequest.get(requestUrl, req.user, function (err, body) {
    	if (req.user)
           res.render('my_home', { title: 'My Home - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl, user: req.user });
    	else
           res.render('index', { title: 'Home - FSTO Demo', header: body,
        	   	headerUrl: headerUrl });    		
    });
};