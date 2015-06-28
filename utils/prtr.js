var logger = require('../utils/logger');

function printRouteRequest(req){
	var ps;
	if(!req.user.pseudonym){
		ps = "";
	}else{
		ps = req.user.pseudonym.toString();
	}
	logger.info(req.connection.remoteAddress.toString().white.bold + ' ' + ps.white.bold + ': ' + req.method.yellow.bold + ' request for ' + req.url.blue.bold);
}

module.exports = {
	printRouteRequest: function(req){
		printRouteRequest(req);
	}
}