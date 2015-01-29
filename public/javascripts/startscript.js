function start(){
	randomizeBackground();
	animateBackground();
	set_welcome_click_listeners();
	set_welcome_keypress_listeners();
	$("#registerpanel").hide();
	$("#emailpseudoinput_login").focus();

  	// if there is a uid stored in the browser
  	// get it, send it to the server and fetch the user pseudonym
	if(window.sessionStorage.getItem("ping_uid") != undefined){
		pseudolookup_insert_uname(window.sessionStorage.getItem("ping_uid"));
	}else if(window.localStorage.getItem("ping_uid") != undefined){
		pseudolookup_insert_uname(window.localStorage.getItem("ping_uid"));
	}else{
		console.log("no uid and no username found.");
	}
}