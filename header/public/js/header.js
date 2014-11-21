
var headerNotifications;

function initHeaderWebSockets(io, origin, notificationUrl, oauth2Proxy) { 
   var socket = io.connect(origin);
   
   initializeNotifications(notificationUrl, oauth2Proxy);
   
   $(function () {
	   $('[data-toggle="popover"]').popover({
		   html: true,
		   content: "<div class='notification-popover'>Loading...</div>"
	   })
	});
   
   socket.on('todos', function(message) {
	   createNotification(message);
	   updateNotificationBadge();
	   renderNotifications();
   });
   
   $('#notification-dropdown-toggle').on('shown.bs.popover', function () {
       renderNotifications();
   });
   
   function renderNotifications() {
      dust.render("notifications", { notifications: headerNotifications }, function(err, out) {
	   	  var content = err?err: out;
	   	  $(".notification-popover").html(content);
       });
   }
   
   function initializeNotifications(notificationUrl, oauth2Proxy) {
	   var proxiedUrl = oauth2Proxy + "?url="+encodeURIComponent(notificationUrl);
	   console.log("Making a proxied call: "+proxiedUrl);

	   $.getJSON(proxiedUrl, function (data, status) {
		   console.log(data.messages);
		   for (i in data.messages) {
			   var message = data.messages[i];
			   createNotification(message);
		   }
		   updateNotificationBadge();
	   });
   }
   
   function createNotification(message) {
      var notificationText;
      if (message.type=='add') {
	     notificationText= message.user.name+ " added \""+message.state.text+"\".";
      }
      else if (message.type=='delete') {
	     notificationText = message.user.name+ " deleted all todos.";
      }
      var notification = {
	     text: notificationText,
	     imageUrl: "https://graph.facebook.com/"+message.user.id+"/picture?type=square"
      };
      if (headerNotifications)
	     headerNotifications.splice(0, 0, notification);
      else
	     headerNotifications = [notification];
      if (headerNotifications.length==11)
    	  headerNotifications.splice(10, 1);
   }
   
   function updateNotificationBadge() {
	   if (headerNotifications && headerNotifications.length>0) {
		   $('#notification-badge').text(headerNotifications.length);
		   $('#notification-badge').removeClass('hidden');
	   }
	   else {
		   $('#notification-badge').addClass('hidden');		   
	   }
   }
}