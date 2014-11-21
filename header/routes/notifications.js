var request = require('request');

var LRU = require("lru-cache")
, options = { max: 500
            , length: function (n) { return n * 2 }
            , maxAge: 1000 * 60 * 10 }
, cache = LRU(options)
;

exports.get = function(req, res) {
	userMiddleware(req, res, function(req, res) {
	   var result = { messages: [] };
	
	   if (req.user) {
		  var entry = cache.get(req.user.id);
		  if (entry)
		     result = entry;
	   }
       res.setHeader('Content-Type', 'application/json');
	   res.write(JSON.stringify(result));	
	   res.end();
	});
}

exports.delete = function(req, res) {
	userMiddleware(req, res, function(req, res) {
	   if (req.user) {
		  cache.del(req.user.id);
	   }
	   res.sendStatus(204);	
	   res.end();
	});	
}

exports.init = function (io, mq) {
	mq.on('ready', function() {
		var exchange = mq.exchange('todos');
		mq.queue('header', function (q) {
			q.bind(exchange, '#');
			q.subscribe(function (message) {
   	           var mObject = JSON.parse(message.data);
   	           var key = mObject.user.id;
    	       var entry = cache.get(key);

    	       if (!entry) {
    	          entry = { messages: [] };
    	          cache.set(key, entry);
    	       }
		       entry.messages.splice(0, 0, mObject);
               if (entry.messages.length==11)
		          entry.messages.splice(10, 1);
		        // forward topic messages to the client
		        io.sockets.emit('todos', mObject);
		    });
	   });
	});
	mq.on('error', function(err) {
	    console.log("MQ error from header: "+err);
	});	
}

function userMiddleware(req, res, next) {
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
				req.isAuthenticated = function () { return true; }
				req.user = body;
				next (req, res);
			}
		);
	}
	else {
		next(req, res);
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