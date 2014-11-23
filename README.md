fsto-demo
=========

##Demo app for the Full Stack Toronto Conference

This demo contains a 4-app micro-service system that uses UI composition and federated auth using Facebook as a provider. When hosted on <http://fsto-demo.mybluemix.net>, it also runs Nginx as a service to provide front-end routing. When run locally, each app is reached directly using localhost:port.

The repo has four sub-folders containing micro-services that need to be individually started:
```
/header
/home
/isomorphic
/server-push
```

In order to run the demo locally, you need the following:

* Register an app with Facebook and obtain client and secret.
* Create 'auth.json' in each app's subfolder as follows:
```
{
	"auth": {
		"Facebook": {
			"client": "-my-app-client-",
			"secret": "-my-app-secret-"
		}
	}
}
```
* Configure the Facebook app to accept http://localhost:3000, http://localhost:3100 and http://localhost:3200 as valid callback URIs (so that authentication can work locally)
* Download and start RabbitMQ using the default port.
* Download and start Redis using the default port.
* Navigate into each of the four folders listed above and type 'npm install' to fetch the Node modules as specified in package.json.
* Start each app by opening a separate shell, navigating to its subfolder, and typing:
```
NODE_ENV=local node app.js
```
* Navigate to http://localhost:3000
