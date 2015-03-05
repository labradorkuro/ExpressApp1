var Client_Controller = function($scope) {
	$scope.division = {
		email:'',
		division_cd:'',
		zipcode:''
	};
};
var appModule = angular.module('app',[]);
appModule.controller('client_controller',['$scope',Client_Controller]);