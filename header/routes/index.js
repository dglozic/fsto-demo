
var nconf = require('nconf');
var request = require('request');

exports.index = function(req, res) {
	var header = nconf.get('config').header;
	var selection = req.query.selection;
	var k8s = process.env.K8S === "true";

	console.log("k8s = " + k8s);
	
	var access_token = _getToken(req);
	
	if (access_token) {
		// fetch user info
		request.get({
			  'url': 'https://graph.facebook.com/me',
			  'json': true,
			  'auth': {
			    'bearer': access_token
			  }
			}, function(err, response, body) {
			   res.render('index', { homeUrl: header.homeUrl, sections: header.sections, 
					selection: selection, loginUrl: header.loginUrl, logoutUrl: header.logoutUrl, user: body, k8s });				
			});
	}
	else {
	   res.render('index', { homeUrl: header.homeUrl, sections: header.sections, 
		selection: selection, loginUrl: header.loginUrl, k8s });
	}
};

function _getToken(req) {
	var auth = req.header('Authorization');
	if (auth) {
		var res = auth.split(' ');
		if (res.length==2)
			return res[1];
	}
	return auth;
}