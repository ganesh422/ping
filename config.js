module.exports = {
	http: {
		port: 1337
	},
	https: {
		port: 1338
	},
	mongodb: {
		server: '127.0.0.1',
		dbname: 'pingdb',
		defaultPoolSize: 5
	},
	userCookie: {
		secret: 'pingisloveislife',
		defaultLifeTime: 2*60*60*1000,
		defaultActiveLifeTime: 1*60*60*1000,
		name: 'user',
		key: 'user'
	},
	sessionCookie: {
		secret: 'thisispinghistory',
		defaultLifeTime: 4*60*60*1000,
		defaultActiveLifeTime: 2*60*60*10000,
		name: 'session',
		key: 'session'
	}
}