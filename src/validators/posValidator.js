const Joi = require("joi");
const prisma = require("../models/prisma");
const { USER_SUPERVISOR, USER_EMPLOYEE } = require("../config/constrants");

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
