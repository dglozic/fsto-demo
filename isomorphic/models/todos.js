var moment = require('moment');

var models = [];

exports.add = function (user, text, callback) {
	var todo = {
		text: text,
		imageUrl: "https://graph.facebook.com/"+user.id+"/picture?type=square",
		userName: user.displayName,
		when: Date.now()
	};
	var model = models[user.id];
	if (!model) {
		model = { todos: [todo] };
		models[user.id]=model;
	}
	else {
		model.todos.splice(0, 0, todo);
	}
	callback(null, todo);
};

exports.list = function(user, callback) {
	var model = models[user.id];
	var todos = model?model.todos:[];
	var result = new Array(todos.length);
	
	for (i in todos) {
		result[i] = JSON.parse(JSON.stringify(todos[i]));
	}
	callback(null, result);
};

exports.deleteAll = function(user, callback) {
	var model = models[user.id];
	if (model) {
	   while(model.todos.length > 0) {
	      model.todos.pop();
	   }
	}
	callback(null);
};