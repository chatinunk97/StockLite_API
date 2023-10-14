const rateLimit = require('express-rate-limit')

module.exports =  limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 10000, // Limit each IP request count
	message : {message : "Too many request made by this IP"}

})
