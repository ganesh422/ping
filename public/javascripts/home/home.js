var app = angular.module("content", []);

// newpost controller
app.controller("new_post", function($scope, $http){
	$scope.submit = function(){
		var request = $http({
    		method: "post",
    		url: "/posts/new",
			data: {
			    valt: $scope.post_text,
			    vals: $('#subselect').val(),
			    valpseudo: window.sessionStorage.getItem("ping_pseudo")
			}
		});

		request.success(function(data){
			if(data.postCreated){
				window.location = "/home";
			}
		});

		request.error(function(data){
			if(data.errorHappened){
				printError("couldn't create post. error.");
			}
		});
	}
});

app.controller("new_sub", function($scope, $http){
	$scope.submit = function(){
		var request = $http({
			method: "post",
			url: "/subs/new",
			data: {
				valn: $scope.sub_name,
				valpseudo: window.sessionStorage.getItem("ping_pseudo")
			}
		});

		request.success(function(data){
			if(data.subCreated){
				window.location = "/home";
			}
		});

		request.error(function(data){
			if(data.errorHappened){
				printError("couldn't create post. error.");
			}else if(data.subNameInUse){
				printError("sub already exists");
			}
		});
	}
});

app.controller("sub_fetch", function($scope, $http){
	$scope.followedSubs = [];

	$scope.init = function () {
    	var request = $http({
    		method: "get",
    		url: "/subs/fetch"
    	});

    	request.success(function(results){
    		$scope.followedSubs.length = 0;
    		$scope.followedSubs = results;
    	});

    	request.error(function(data){
    		if(data.errorHappened){
				printError("couldn't fetch subs. error.");
			}
    	});
	};
});

function home_start(){
	$('textarea').on('keyup',function(){
	  var spanwidth = $('span').css('width')
	  $('textarea').css('width',spanwidth) 
	})

	set_home_close_listener();
	set_home_click_listeners();

	https_redirect();

	$("#newsubpanel").hide();
}

function set_home_click_listeners(){
	$("#newpost").bind("click", function () {
		if($("#newpostpanel").is(":visible")){
			//$("#newpostpanel").hide();
		}else{
			if($("#newsubpanel").is(":visible")){
				$("#newsubpanel").hide();
			}
			$(".input").val("");
			$("#newpostpanel").show();
		}
	});

	$("#newsub").bind("click", function(){
		if($("#newsubpanel").is(":visible")){
			//
		}else{
			if($("#newpostpanel").is(":visible")){
				$("#newpostpanel").hide();
				$(".input").val("");
			}
			$("#newsubpanel").show();
		}
	});
}

function set_home_close_listener(){
	window.onbeforeunload = function (e) {
		$.ajax({
			type: "get",
			url: "/logout"
		});
	};
}