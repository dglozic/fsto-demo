/**
 * Module dependencies.
 */

var express = require('express')
  , server_push = require('./routes/server-push')
  , auth_proxy = require('./lib/auth_proxy') 
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
		  res.redirect('/server-push/auth/facebook');
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
	app.get('/server-push', server_push.get);
	app.post('/server-push', server_push.post);
	
	// OAuth2 proxy route for the header to use, so that it can make per-user calls
	app.all('/server-push/oauth2-proxy', auth_proxy.all);	

	// Auth routes
	app.get('/server-push/auth/facebook', passport.authenticate('facebook', { faulureRedirect: '/', scope: ['public_profile', 'email'] }));
	app.get('/server-push/auth/facebook/callback', 
			  passport.authenticate('facebook'),
			  function(req, res) {
		         res.redirect('/server-push');
 	});
	app.get('/server-push/logout', function(req, res) {
		req.logout();
		res.redirect(302, FacebookAuth.logoutRedirectUrl);
	});
	

	//Start the server
	
	var server = app.listen(app.get('port'), function(){
	  console.log('Server Push express server '+process.pid+' listening on port ' + app.get('port'));
	});

	var io = require('socket.io')(server);
	
	server_push.io = io;

	io.on('connection', function (socket) {
		socket.emit('message', { my: 'data' });
    });	