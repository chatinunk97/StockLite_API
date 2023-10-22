const prisma = require("../models/prisma");
const createError = require("../utils/createError");
const {
  checkExistingShelf,
  checkQuantityNum,
  checkQuantitySufficient,
} = require("../validators/posValidator");

exports.createTransaction = async (req, res, next) => {
  try {
    if (!(await checkExistingShelf(req.body))) {
      return next(createError("One or more shelf was not found", 400));
    }
    if (!(await checkQuantityNum(req.body))) {
      return next(createError("Invalid Number was input in to Quantity", 400));
    }
    //Change quantity to number
    for (el of req.body) {
      el.quantity = +el.quantity;
    }

    //check quantity sufficient
    if (!(await checkQuantitySufficient(req.body))) {
      return next(createError("Insuffecient shelf quantity", 400));
    }
    const inputData = {
      userId: +req.user.userId,
      transactionToProductShelf: {
        create: req.body,
      },
    };

    const createResult = await prisma.transaction.create({
      data: inputData,
      include: {
        transactionToProductShelf: {
          include: {
            productShelf: true,
          },
        },
      },
    });

    //Subtract from the shelf quantity
    for (el of req.body) {
      await prisma.productShelf.update({
        where: { shelfItemId: +el.productShelf.connect.shelfItemId },
        data: { shelfQuantity: { decrement: +el.quantity } },
      });
    }
    res.json({ createResult });
  } catch (error) {
    next(error);
  }
};
exports.getTransaction = async (req, res, next) => {
  try {
    const searchResult = await prisma.transaction.findMany({
      where: { User: { companyId: +req.user.companyId } },
      include: {
        transactionToProductShelf: {
          select: {
            quantity: true,
            productShelf: {
              select: {
                productStock: {
                  select: { pricePerUnit: true, productName: true },
                },
              },
            },
          },
        },
      },
    });
    res.json({ searchResult });
  } catch (error) {
    next(error);
  }
};
