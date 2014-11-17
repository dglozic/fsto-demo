
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

var build = {
		   running: false,
		   progress: 0,
		   errors: false
		};
		 
var _lastTimeout;
		 
exports.post = function(req, res) {
   var action = req.body.action;
		 
   if (action==="stop") {
       // stop the build.
       build.running = false;
       if (_lastTimeout)
           clearTimeout(_lastTimeout);
       _pushEvent("build");
   }
   else if (action==="start") {
       // reset the build, start from 0
       build.running = true;
       build.errors=false;
       build.progress = 0;
       _pushEvent("build");
       _lastTimeout = setTimeout(_buildWork, 1000);
   }
};
		 
function _buildWork() {
    build.progress += 10;
    if (build.progress==70)
        build.errors=true;
    if (build.progress < 100) {
        _pushEvent("build");
        _lastTimeout = setTimeout(_buildWork, 1000);
    }
    else {
        build.running = false;
        _pushEvent("build");
    }
}
		 
function _pushEvent(event) {
    exports.io.sockets.emit(event, build);
}