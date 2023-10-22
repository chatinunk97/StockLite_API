const Joi = require("joi");
const prisma = require("../models/prisma");

const supplierCreateSchema = Joi.object({
  supplierId: Joi.number().allow(null, "").label("Supplier ID"),
  supplierName: Joi.string().max(100).label("Supplier Name").required(),
  supplierAddress: Joi.string().max(225).label("Supplier Address").required(),
  supplierTel: Joi.string().max(225).label("Supplier Tel").required(),
  companyId: Joi.number().required(),
});

const supplierFilterSchema = Joi.object({
  supplierId: Joi.number().allow(null, "").label("Supplier ID"),
  supplierName: Joi.string().max(100).allow(null, "").label("Supplier Name"),
  supplierAddress: Joi.string()
    .max(225)
    .allow(null, "")
    .label("Supplier Address"),
  supplierTel: Joi.string().max(225).allow(null, "").label("Supplier Tel"),
  companyId: Joi.number().allow(null, ""),
});
const startAndEndDateSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});
const wmsIdSchema = Joi.number();

const createOrderSchema = Joi.object({
  supplierId: Joi.number().required(),
  sumPrice: Joi.number().required(),
  receiveDate: Joi.date().label("Receive Date"),
  userId: Joi.number().required(),
});
const editOrderSchema = Joi.object({
  orderId: Joi.number().required(),
  sumPrice: Joi.number().required(),
  receiveDate: Joi.date().allow("",null),
});
const createStockSchema = Joi.object({
  orderId: Joi.number().required(),
  productName: Joi.string().max(100).required(),
  stockQuantity: Joi.number().required(),
  pricePerUnit: Joi.number().required(),
  expirationDate: Joi.date().allow(null, ""),
});

const orderFilterSchema = Joi.object({
  orderId: Joi.number().allow(null, ""),
  supplierId: Joi.number().allow(null, ""),
  sumPrice: Joi.number().allow(null, "").label("Total Expense"),
  startDate: Joi.date().allow(null, "").label("Date From"),
  endDate: Joi.date().allow(null, "").label("Date Until"),
  username: Joi.string().allow(null, ""),
});

const stockFilterSchema = Joi.object({
  stockId: Joi.number().allow(null, ""),
  orderId: Joi.number().allow(null, ""),
  supplierName: Joi.string().allow(null, ""),
  productName: Joi.string().allow(null, ""),
  stockQuantity: Joi.number().allow(null, ""),
  pricePerUnit: Joi.number().allow(null, ""),
  expirationDate: Joi.date().allow(null, "").label("EXP Date"),
});

const stockEditSchema = Joi.object({
  stockId: Joi.number().allow(null, ""),
  productName: Joi.string().allow(null, ""),
  stockQuantity: Joi.number().allow(null, ""),
  pricePerUnit: Joi.number().allow(null, ""),
  expirationDate: Joi.date().allow(null, "").label("EXP Date"),
});

const shelfAddCountSchema = Joi.object({
  shelfItemId : Joi.number().required(),
  shelfAddQuantity : Joi.number().required()
})

const shelfFilterSchema = Joi.object({
  shelfItemId: Joi.number().allow(null, ""),
  stockId: Joi.number().allow(null, ""),
  shelfQuantity: Joi.number().allow(null, ""),
  stockQuantity: Joi.number().allow(null, ""),
  expirationDate: Joi.date().allow(null, "").label("EXP Date"),
  productName : Joi.string().allow(null, ""),
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
exports.ChecExistOrder = async (orderId) => {
  const existOrder = await prisma.orderList.findFirst({
    where: { orderId: orderId },
  });
  return existOrder;
};
exports.checkExistStock = async (stockId) => {
  const existOrder = await prisma.productStock.findFirst({
    where: { stockId: stockId },
  });
  return existOrder;
};
exports.checkStartEndDate = (input) => {
  return startAndEndDateSchema.validate(input);
};
exports.checkCreateOrder = (input) => {
  return createOrderSchema.validate(input);
};

exports.checkEditOrder = (input) => {
  return editOrderSchema.validate(input);
};
exports.checkCreateStock = (input) => {
  return createStockSchema.validate(input);
};

exports.checkOrderFilter = (input) => {
  return orderFilterSchema.validate(input);
};

exports.checkStockFilter = (input) => {
  return stockFilterSchema.validate(input);
};

exports.checkStockEdit = (input)=>{
  return stockEditSchema.validate(input)
}

exports.checkShelfAdd = (input)=>{
  return shelfAddCountSchema.validate(input)
}
exports.checkShelfFilter = (input)=>{
  return shelfFilterSchema.validate(input)
}
exports.CheckExistShelf = async (shelfItemId) => {
  const existShelf = await prisma.productShelf.findFirst({
    where: { shelfItemId: shelfItemId },
  });
  return existShelf;
};