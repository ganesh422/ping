// =============================================
// =================LAUNCH HOME=================
// =============================================
https_redirect();
document.getElementById("logo").onclick = function(){
	window.location = "/";
};
document.getElementById("newpost").onclick = function(){
	document.getElementById("post_list_container").style.display = "none";
	document.getElementById("contentcreation").style.display = "inline";
	document.getElementById("newsubpanel").style.display = "none";
	document.getElementById("newpostpanel").style.display = "inline-block";
};
document.getElementById("newsub").onclick = function(){
	document.getElementById("post_list_container").style.display = "none";
	document.getElementById("contentcreation").style.display = "inline";
	document.getElementById("newsubpanel").style.display = "inline-block";
	document.getElementById("newpostpanel").style.display = "none";
};

// =============================================
// ===============ANGULAR STUFF=================
// =============================================
var app = angular.module("home", []);

app.run(["$rootScope", "$http", function($rootScope, $http){
    update_feed($rootScope, $http);
	document.getElementById("post_list_container").style.display = "inline-block";
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
            printError(data.error.toString());
        } 
    });
}

app.controller("FeedCtrl",["$scope", "$http", function($scope, $http){
    $scope.refresh_feed = function(){
        update_feed($scope, $http);
    };
    
    $scope.post_pseudonym_click = function(post){
		window.location = ("/u/" + post.creators);
    };
    
    $scope.post_sub_click = function(post){
        window.location = ("/s/" + post.sub);
    };

	$scope.joinSub = function(){
		var request = $http({
			method: "get",
			url: "/join/" + document.URL.split("/")[4]
		});

		request.success(function(data){
			if(data.status){
				alert(data.status);
			}
		});

		request.error(function(data){
			if(data.status){
				alert(data.status);
			}
		});
	};
}]);

app.controller("ContentCreationCtrl", function($scope, $http){
	/* new post submit */
	$scope.np_submit = function(){
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
			if(data.status){
				window.location = "/";
			}
		});

		request.error(function(data){
			if(data.status){
				alert(data.status);
			}
		});
	};

	/*new sub submit */
	$scope.ns_submit = function(){
		var request = $http({
			method: "post",
			url: "/newsub",
			data: {
				name: $scope.sub_name
			}
		});

		request.success(function(data){
			if(data.status == 103){
				window.location = "/";
			}
		});

		request.error(function(data){
			alert(data.status);
		});
	};
});

app.controller("MiscCtrl", function($scope, $http){
	$scope.logout = function(){
		var request = $http({
			method: "get",
			url: "/logout"
		});

		request.success(function(){
			window.location = "/";
		});

		request.error(function(){
			alert("An error occured.");
		});
	};

	$scope.followedSubs = [];

	$scope.sub_fetch = function () {
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