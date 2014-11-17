
var crequest = require("../lib/cached_request");
var nconf = require('nconf');

exports.index = function(req, res) {
	var headerUrl = nconf.get('config').header.url;
	var requestUrl = headerUrl+"?selection=server-push";

    crequest.get(requestUrl, req.user, function (err, body) {
        res.render('index', { title: 'Server Push - FSTO Demo', header: body, 
        	   	headerUrl: headerUrl, user: req.user });
     });
};