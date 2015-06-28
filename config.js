module.exports = {
	http: {
		port: process.env.HTTP_PORT || 1337
	},
	https: {
		port: process.env.HTTPS_PORT || 1338
	},
	mongodb: {
		server: process.env.DB_ADDRESS || '127.0.0.1',
		dbname: process.env.DB_NAME || 'pingdb',
		defaultPoolSize: process.env.DB_POOLSIZE_DEFAULT || 5
	},
	userCookie: {
		secret: process.env.AUTH_SECR || 'devsecr',
		defaultLifeTime: process.env.AUTH_DEFAULT_LIFETIME || 2*60*60*1000,
		defaultActiveLifeTime: process.env.AUTH_DEFAULT_ACTIVE_LIFETIME || 1*60*60*1000,
		name: process.env.AUTH_COOKIE_NAME || 'user',
		key: process.env.AUTH_KEY || 'user'
	}
}