/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , auth_proxy = require('./lib/auth_proxy')
  , about = require('./routes/about')   
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
		  if (req.isAuthenticated() || !process.env.VCAP_SERVICES) { 
		      return next(); 
		  }
		  res.redirect('/auth/facebook');
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
	var sessionConfig = config.session;

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
	app.get('/', routes.index);
	app.get('/about', about.about);
	
	// OAuth2 proxy route for the header to use, so that it can make per-user calls
	app.all('/oauth2-proxy', auth_proxy.all);
	
	// Auth routes
	app.get('/auth/facebook', passport.authenticate('facebook', { faulureRedirect: '/', scope: ['public_profile', 'email'] }));
	app.get('/auth/facebook/callback', 
			  passport.authenticate('facebook'),
			  function(req, res) {
		         res.redirect('/');
 	});
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect(302, FacebookAuth.logoutRedirectUrl);
	});

	//Start the server
	
	app.listen(app.get('port'), function(){
	  console.log('Home express server '+process.pid+' listening on port ' + app.get('port'));
	});
