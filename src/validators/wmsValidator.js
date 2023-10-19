const Joi = require("joi");
const prisma = require("../models/prisma");

const supplierCreateSchema = Joi.object({
  supplierId: Joi.number().max(100).allow(null, "").label("Supplier ID"),
  supplierName: Joi.string().max(100).label("Supplier Name").required(),
  supplierAddress: Joi.string().max(225).label("Supplier Address").required(),
  supplierTel: Joi.string().max(225).label("Supplier Tel").required(),
  companyId: Joi.number().max(100).required(),
});

const supplierFilterSchema = Joi.object({
  supplierId: Joi.number().max(100).allow(null, "").label("Supplier ID"),
  supplierName: Joi.string().max(100).allow(null, "").label("Supplier Name"),
  supplierAddress: Joi.string()
    .max(225)
    .allow(null, "")
    .label("Supplier Address"),
  supplierTel: Joi.string().max(225).allow(null, "").label("Supplier Tel"),
  companyId: Joi.number().max(100).allow(null, ""),
});
const startAndEndDateSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});
const wmsIdSchema = Joi.number().max(100).label("Supplier Id");

const createOrderSchema = Joi.object({
  supplierId: Joi.number().required(),
  sumPrice: Joi.number().required(),
  receiveDate: Joi.date(),
  userId : Joi.number().required()
});
const editOrderSchema = Joi.object({
  orderId : Joi.number().required(),
  sumPrice : Joi.number().required(),
  receiveDate : Joi.date().required()
})

exports.ValidateSupplierInput = (input) => {
  return supplierCreateSchema.validate(input);
};
exports.ValidateSupplierFilter = (input) => {
  return supplierFilterSchema.validate(input);
};
exports.ValidateIds = (input) => {
  return wmsIdSchema.validate(input);
};
exports.CheckSupplier = async (companyId, supplierId) => {
  const existSupplier = await prisma.supplier.findFirst({
    where: { AND: [{ companyId }, { supplierId }] },
  });
  return existSupplier;
};
exports.ChecExistOrder = async (orderId)=>{
  const existOrder = await prisma.orderList.findFirst({
    where : { orderId : orderId}
  })
  return existOrder
}
exports.checkStartEndDate = (input) => {
  return startAndEndDateSchema.validate(input);
};
exports.checkCreateOrder = (input) => {
  return createOrderSchema.validate(input);
};

exports.checkEditOrder = (input)=>{
  return editOrderSchema.validate(input)
}