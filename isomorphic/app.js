/**
 * Module dependencies.
 */

var express = require('express')
  , isomorphic = require('./routes/isomorphic')
  , auth_proxy = require('./lib/auth_proxy')
  , todos = require('./routes/todos')
  , dust = require('dustjs-linkedin')
  , helpers = require('dustjs-helpers')
  , cons = require('consolidate')
  , path = require('path')
  , nconf = require('nconf')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , methodOverride = require('method-override')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , multer = require('multer')
  , errorHandler = require('errorhandler')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , RedisStore = require('connect-redis')(session)
  , amqp = require('amqp')
  ;

	var app = express();
	var env = app.get('env');
	var k8s = process.env.K8S === "true";
	
/**
 * Load hierarchical config
 */
	nconf.env().argv();
	if (k8s) {
		nconf.file(env, './config/app-k8s.json');
	} else if (env) {
		nconf.file(env, './config/app-'+env+'.json');
	}
	// The config file 'auth.json' is not provided for security reasons.
	// When you obtain your own Facebook client and secret, create it in config in the following shape:
	//{
	//	"auth": {
	//		"Facebook": {
	//			"client": "-my-app-client-",
	//			"secret": "-my-app-secret-"
	//		}
	//	}
	//}	
	nconf.file('auth', './config/auth.json');
	nconf.file('./config/app.json');	

/**
 * Setting up auth boilerplate
 */

	//Serialize and deserialize the profile
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	
	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});
	
	var FacebookAuth = nconf.get('auth').Facebook;
	
	passport.use(new FacebookStrategy({
	    clientID: FacebookAuth.client,
	    clientSecret: FacebookAuth.secret,
	    callbackURL: FacebookAuth.callbackUrl
	  },
	  function(accessToken, refreshToken, profile, done) {
		  profile.token = accessToken;
	      return done(null, profile);
	  }
	));
	
	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { 
	      return next(); 
	  }
	  res.redirect('/isomorphic/auth/facebook');
	}
	
	function preventUnauthenticated(req, res, next) {
	   if (req.isAuthenticated()) {
		   return next();
	   }
	   res.write(JSON.stringify({message: "This endpoint requires full authentication."}));
	   res.send(401);
	   res.end();
	}	
	
	var config = nconf.get('config');
	
/**
 * Redis store options
 */
	var ropts = {
		host: config.redis.host,
		port: config.redis.port,
		url: config.redis.url
	};
	
/**
 * Setting up express
 */
	var sessionConfig = nconf.get('config').session;

	// all environments
	app.set('port', process.env.PORT || nconf.get('port'));
	app.set('views', path.join(__dirname + '/views'));
	app.engine('dust', cons.dust);
	app.set('view engine', 'dust');
	//app.use(favicon(__dirname + '/public/favicon.ico'));
	app.use(methodOverride());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(multer());
	app.use(express.static(path.join(__dirname, 'public')));
	//app.use(session({ key: sessionConfig.key, 
	//				secret: sessionConfig.secret, saveUninitialized: true, resave: true}));	
	app.use(session({ key: sessionConfig.key, store: new RedisStore(ropts), 
					secret: sessionConfig.secret, saveUninitialized: true, resave: true}));
	app.use(passport.initialize());
	app.use(passport.session());
	
    // development only
	if ('development' == env) {
	  app.use(errorHandler());
	}

	// Routes
	app.get('/isomorphic', ensureAuthenticated, isomorphic.get);
	app.get('/isomorphic/todos', preventUnauthenticated, todos.get);	
	app.post('/isomorphic/todos', preventUnauthenticated, todos.post);
	app.delete('/isomorphic/todos', preventUnauthenticated, todos.delete);	
	
	// OAuth2 proxy route for the header to use, so that it can make per-user calls
	app.all('/isomorphic/oauth2-proxy', auth_proxy.all);

	// Auth routes
	app.get('/isomorphic/auth/facebook', passport.authenticate('facebook', { faulureRedirect: '/', scope: ['public_profile', 'email'] }));
	app.get('/isomorphic/auth/facebook/callback', 
			  passport.authenticate('facebook'),
			  function(req, res) {
		         res.redirect('/isomorphic/');
 	});
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect(302, FacebookAuth.logoutRedirectUrl);
	});

	//Start the server
	
	var server = app.listen(app.get('port'), function(){
	  console.log('Isomorphic express server '+process.pid+' listening on port ' + app.get('port'));
	});

	var io = require('socket.io')(server);
	
	isomorphic.io = io;
	todos.io = io;
	
	//Connect to the AMQP broker
	var mq;
	var amqpConfig = nconf.get('config').amqp;
   	if (amqpConfig) {
   		if (amqpConfig.url) {
	   	   mq = amqp.createConnection({ 
		   	    url: amqpConfig.url,
		   	    ssl: amqpConfig.ssl
		   });
		} else {
	   	   mq = amqp.createConnection({ 
		   	   	port: amqpConfig.port, 
		   	   	host: amqpConfig.host
		   });			
		}
   }

	todos.mq = mq;

	if (mq) {
		mq.on('ready', function() {
			var exchange = mq.exchange('todos');
			todos.exchange = exchange; 
			mq.queue('isomorphic', function (q) {
				q.bind(exchange, '#');
				q.subscribe(function (message) {
					io.sockets.emit('todos', JSON.parse(message.data));				
				});
			});
		});
		mq.on('error', function(err) {
		    console.log("MQ error from isomorphic: "+err);
		});
	}
	