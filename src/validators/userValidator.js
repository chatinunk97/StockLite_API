const Joi = require('joi')

exports.registerComapnySchema = Joi.object({
    companyName: Joi.string().required(),
    companyLogo: Joi.string().required()
})