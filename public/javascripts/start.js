function https_redirect(){
	// only works with http and https standard ports
	// redirects to https page
	/*if(window.location.protocol == "http:"){
		restOfUrl = window.location.href.substr(5);
		window.location.replace("https:" + restOfUrl);
	}*/

	// because it only works with standard ports, we use this for now
	if(window.location.protocol == "http:"){
		$("#errors").text("HTTP is very insecure, please visit the HTTPS page.");
	}
}

function start_welcome(){
	// function in welcome.js
	welcome_start();
}

function start_home(){
	
}