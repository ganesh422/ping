document.getElementById("logo").onclick = function(){
	window.location = "/";
};

document.getElementById("link_home").onclick = function(){
	window.location = "/";
};

// =============================================
// ===============ANGULAR STUFF=================
// =============================================
var app = angular.module("people", []);

app.controller("PeopleCtrl",["$scope", "$http", function($scope, $http){
    $scope.follow = function(){
    	var request = $http({
	        method: "post",
	        url: ("/follow/" + document.URL.split("/")[4])
	    });
	    
	    request.success(function(data){        
	        if(data){
	            alert(data.status);
	        }
	    });
	    
	    request.error(function(data){
	        if(data){
	            printError(data.toString());
	        } 
	    });
    }
}]);

app.controller("PostCtrl", ["$scope", "$http", function($scope, $http){
	// to do
}]);