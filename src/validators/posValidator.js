const Joi = require("joi");
const prisma = require("../models/prisma");
const numberSchema = Joi.number();

exports.checkExistingShelf = async (arr) => {
  for (el of arr) {
    const searchResult = await prisma.productShelf.findFirst({
      where: { shelfItemId: el.productShelf.connect.shelfItemId },
    });
    if (!searchResult) {
      return false;
    }
  }
  return true;
};
exports.checkQuantityNum = async (arr) => {
  for (el of arr) {
    const { value, error } = numberSchema.validate(el.quantity);
    if (error) {
      return false;
    }
  }
  return true;
};

exports.checkQuantitySufficient = async (arr) => {
  for (el of arr) {
    const searchResult = await prisma.productShelf.findFirst({
      where: { shelfItemId: el.productShelf.connect.shelfItemId },
    });
    if (
      !searchResult.shelfQuantity ||
      searchResult.shelfQuantity < el.quantity
    ) {
      return false;
    }
  }
  return true;
};
const shelfFilterSchema = Joi.object({
  shelfItemId: Joi.number().allow(null, ""),
  stockId: Joi.number().allow(null, ""),
  shelfQuantity: Joi.number().allow(null, ""),
  stockQuantity: Joi.number().allow(null, ""),
  expirationDate: Joi.date().allow(null, "").label("EXP Date"),
  productName : Joi.string().allow(null, ""),
})

exports.checkShelfFilter = (input)=>{
  return shelfFilterSchema.validate(input)
}