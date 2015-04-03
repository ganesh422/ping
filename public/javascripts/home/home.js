var app = angular.module("home", []);

app.run(["$rootScope", "$http", function($rootScope, $http){
    update_feed($rootScope, $http);
}]);

function update_feed($scope, $http){
    var request = $http({
        method: "post",
        url: "/getposts",
        data:{
            selection: document.URL.split("/")[document.URL.split("/").length - 1]
        }
    });
    
    request.success(function(data){        
        if(data){
            if($scope.posts){
                if(data.posts.length > $scope.posts.length){
                    for(var i = 0; i <= data.posts.length - $scope.posts.length; i++){
                        $scope.posts.unshift(data.posts[0]); //unshift to push to front
                    }
                }
            }else{
                $scope.posts = data.posts;
            }
        }
    });
    
    request.error(function(data){
        if(data){
            printError(data.toString());
        } 
    });
}

app.controller("FeedCtrl",["$scope", "$http", function($scope, $http){
    $scope.refresh_feed = function(){
        update_feed($scope, $http);
    };
    
    $scope.post_pseudonym_click = function(){
        window.location = ("/u/" + $("#post_tag_creator").text());
    }
    
    $scope.post_sub_click = function(){
        window.location = ("/s/" + $("#post_tag_sub").text());
    }
}]);

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
	  var spanwidth = $('span').css('width');
	  $('textarea').css('width',spanwidth) 
	});

	set_home_click_listeners();

	https_redirect();

	$("#contentcreation").hide();
}

function set_home_click_listeners(){
	$("#logo").bind("click", function(){
		window.location = "/";
	});

	$("#newpost").bind("click", function () {
		$("#post_list_content").hide();
		$("#contentcreation").show();
		$("#newsubpanel").hide();
		$("#newpostpanel").show();
	});

	$("#newsub").bind("click", function(){
		$("#post_list_content").hide();
		$("#contentcreation").show();
		$("#newsubpanel").show();
		$("#newpostpanel").hide();
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
