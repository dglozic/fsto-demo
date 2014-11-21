
var request = require('request');

exports.all = function (req, res) {
	var url = req.query.url;

	var options =  {
		url: url,
		method: req.method
	};
	var token = req.user?req.user.token:null;
	if (token) {
		options.auth = { bearer: token };
	}
	request(options).pipe(res);
}