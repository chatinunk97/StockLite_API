const Joi = require("joi");
const prisma = require("../models/prisma");
const { USER_SUPERVISOR } = require("../config/constrants");

const supplierCreateSchema = Joi.object({
supplierId : Joi.number().max(100).allow(null, ''),
  supplierName: Joi.string().max(100).required(),
  supplierAddress: Joi.string().max(225).required(),
  supplierTel: Joi.string().max(225).required(),
  companyId: Joi.number().max(100).required(),
});

const supplierFilterSchema = Joi.object({
    supplierId : Joi.number().max(100).allow(null, ''),
    supplierName: Joi.string().max(100).allow(null, ''),
    supplierAddress: Joi.string().max(225).allow(null, ''),
    supplierTel: Joi.string().max(225).allow(null, ''),
    companyId: Joi.number().max(100).allow(null, ''),
  });

  const supplierIdSchema = Joi.number().max(100).label("Supplier Id")

exports.ValidateSupplierInput = (input) => {
  return supplierCreateSchema.validate(input);
};
exports.ValidateSupplierFilter = (input) => {
  return supplierFilterSchema.validate(input);
};
exports.ValidateSupplierId = (input)=>{
    return supplierIdSchema.validate(input)
}