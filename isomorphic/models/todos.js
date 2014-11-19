var moment = require('moment');

var todos = [
             {
            	 text: "Buy milk",
             	 userName: "John Doe",
            	 when: Date.now()
             },
             {
            	 text: "Install winter tires",
             	 userName: "John Doe",
            	 when: Date.now()
             },             
];

exports.add = function (user, text, callback) {
	var todo = {
		text: text,
		imageUrl: "https://graph.facebook.com/"+user.id+"/picture?type=square",
		userName: user.displayName,
		when: Date.now()
	};
	todos.splice(0, 0, todo);
	callback(null, todo);
}

exports.list = function() {
	var result = new Array(todos.length);
	
	for (i in todos) {
		var todo = todos[i];
		result[i] = { text: todo.text, userName: todo.userName, when: todo.when };
	}
	return result;
}

exports.deleteAll = function(callback) {
	while(todos.length > 0) {
	    todos.pop();
	}
	callback(null);
}