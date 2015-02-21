// =============================================
// ===============ANGULAR STUFF=================
// =============================================
var app = angular.module("welcome", []);

//login controller
app.controller("WelcomeController", function($scope, $http){
	var errors_signin = $("#errors_signin");
	var errors_signup = $("#errors_signup");

	$scope.signin = function(){
		if($("#input_emailpseudonym").val() == "" || $("#input_passwd_signin").val() == ""){
			errors_signin.text("Please fill all fields.");
			errors_signin.show();
		}else if($("#input_emailpseudonym").val() == ""){
			errors_signin.text("Please enter an e-mail address or pseudonym.");
			errors_signin.show();
		}else if($("#input_passwd_signin").val() == ""){
			errors_signin.text("Please enter your password.");
			errors_signin.show();
		}else{
			errors_signin.hide();
			var request = $http({
				method: "post",
				url: "/login",
				data: { 
					emailpseudonym: $scope.emailpseudonym,
					passwd: $scope.passwd_signin
				}
			});

			request.success(function(data){
				window.location = "/me";
			});

			request.error(function(data){
				if(data.status == "The password you entered is invalid."){
					$scope.passwd_signin = "";
				}
				errors_signin.text(data.status);
				errors_signin.show();
			});
		}
	}

	$scope.signup = function(){
		if($("#input_email").val() == "" || $("#input_name").val() == "" || $("#input_pseudonym").val() == "" || $("#input_passwd").val() == "" || $("#input_passwdr").val() == ""){
			errors_signup.text("Please fill all fields.");
			errors_signup.show();
		}else if(!checkIfEmailInString($("#input_email").val())){
			errors_signup.text("This e-mail address is invalid. Please enter a valid one.");
			errors_signup.show();
		}else if($scope.name.length < 2){
			errors_signup.text("Please enter at least your first name.");
			errors_signup.show();
		}else if($scope.passwd.length < 6){
			errors_signup.text("Your password must be at least 6 digits long.");
			errors_signup.show();
			$scope.passwd = "";
			$scope.passwdr = "";
		}else if($scope.passwd != $scope.passwdr){
			errors_signup.text("The passwords you entered don't match.");
			errors_signup.show();
		}else{
			errors_signup.hide();
			var request = $http({
				method: "post",
				url: "/signup",
				data: { 
					email: $scope.email,
					name: $scope.name,
					pseudonym: $scope.pseudonym,
					passwd: $scope.passwd
				}
			});

			request.success(function(data){
				window.location = "/";
			});

			request.error(function(data){
				errors_signup.text(data.status);
				errors_signup.show();
			});
		}
	}
});

// =============================================
// ===============LAUNCH WELCOME================
// =============================================
function welcome_start(){
	$("#signup").hide();
	$("#errors_signin").hide();
	$("#errors_signup").hide();
    //var dg_H = screen.height;
    //var dg_W = screen.width;
    $("#bgcontainer img.bgfade").hide();
    $("#bgcontainer").css({"height":"120%","width":"100%"});
    anim();
    //$(window).resize(function(){window.location.href=window.location.href});
    $("#input_emailpseudonym").focus();
}