
var crequest = require("../lib/cached_request");
var nconf = require('nconf');

exports.about = function(req, res) {
	var headerUrl = nconf.get('config').header.url;
	var requestUrl = headerUrl+"?selection=about";

    crequest.get(requestUrl, req.user, function (err, body) {
        res.render('about', { title: 'About - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl, user: req.user });		
    });
};