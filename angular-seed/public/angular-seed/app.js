'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);	
  $routeProvider.
  		when(
		  '/angular-seed/view1', {
	        	templateUrl: 'view1/view1.html'
	    }).
	    when(
	      '/angular-seed/view2', {
  	        	templateUrl: 'view2/view2.html'
        }).	
        when(
          '/angular-seed/', {
                redirectTo: '/angular-seed/view1'
        });
}]);
