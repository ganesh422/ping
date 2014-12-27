
// all click listeners for the welcome page
// for the "links" to change the forms between login and register
// for the registration and login button
function set_welcome_click_listeners(){
	$("#gotoreg_login").bind("click", function () {
		$(":input").val("");
		$("#regbutton_reg").val("Create my account");
		$(".registerpanel").addClass("active");
		$(".loginpanel").removeClass("active");
		$(".loginpanel").hide();
		$(".registerpanel").show();
	});

	$("#gotologin_reg").bind("click", function () {
		$(":input").val("");
		$("#loginbutton_login").val("Log in");
		$(".loginpanel").addClass("active");
		$(".registerpanel").removeClass("active");
		$(".registerpanel").hide();
		$(".loginpanel").show();
	});

	$("#regbutton_reg").click(function(){
		register();
	});

	$("#loginbutton_login").click(function(){
		login();
	});
}

// listen for enter on the inputs
function set_welcome_keypress_listeners(){
	$(".login").bind("keypress", function (e) {
	    var key = e.which || e.keyCode;
	    if (key == 13) { // 13 is enter
	      login();
	    }
	});

	$(".reg").bind("keypress", function (e) {
	    var key = e.which || e.keyCode;
	    if (key == 13) { // 13 is enter
	      register();
	    }
	});
}
