var app = angular.module("content", []);

// newpost controller
app.controller("new_post", function($scope, $http){
	$scope.submit = function(){
		var request = $http({
    		method: "post",
    		url: "/newpost",
			data: {
				title: $scope.title,
			    text: $scope.post_text,
			    sub: $('#subselect').val()
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
			url: "/newsub",
			data: {
				name: $scope.sub_name
			}
		});

		request.success(function(data){
			if(data.status == 103){
				alert("Community created");
			}
		});

		request.error(function(data){
			alert(data.status);
		});
	}
});

app.controller("sub_fetch", function($scope, $http){
	$scope.followedSubs = [];

	$scope.init = function () {
    	var request = $http({
    		method: "get",
    		url: "/fetchsubs"
    	});

    	request.success(function(results){
    		if(results.subs){
    			$scope.followedSubs.length = 0;
    			$scope.followedSubs = results.subs;
    		}
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

	$("#logout").bind("click", function(){
		$.ajax({
			type: "get",
			url: "/logout"
		})
		.done(function(){
			window.location = "/welcome";
		});
	});
}
