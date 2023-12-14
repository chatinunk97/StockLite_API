const prisma = require("../models/prisma");
const createError = require("../utils/createError");
const {
  checkExistingShelf,
  checkQuantityNum,
  checkQuantitySufficient,
  checkShelfFilter
} = require("../validators/posValidator");

exports.createTransaction = async (req, res, next) => {
  try {

    if (!(await checkExistingShelf(req.body.item))) {
      return next(createError("One or more shelf was not found", 400));
    }
    
    if (!(await checkQuantityNum(req.body.item))) {
      return next(createError("Invalid Number was input in to Quantity", 400));
    }
  
    //Change quantity to number
    for (el of req.body.item) {
      el.quantity = +el.quantity;
    }

    //check quantity sufficient
    if (!(await checkQuantitySufficient(req.body.item))) {
      return next(createError("Insuffecient shelf quantity", 400));
    }
    
    const inputData = {
      userId: +req.user.userId,
      sumSale : +req.body.sumSale,
      transactionToProductShelf: {
        create: req.body.item,
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
    for (el of req.body.item) {
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
exports.filterShelf = async (req, res, next) => {
  try {
    const { value, error } = checkShelfFilter(req.query);
    if (error) {
      return next(error);
    }
    //Filter for productStock table
    const filterStockObj = {};
    if (value.productName) {
      filterStockObj.productName = { startsWith: "%" + value.productName };
    }
    if(value.stockQuantity){
      filterStockObj.stockQuantity = { gt: value.stockQuantity - 1 };
    }
    if (value.expirationDate) {
      filterStockObj.expirationDate = { lt: value.expirationDate };
    }

    //Filter for productShelf table
    const filterShelfObj = {}
    if(value.shelfItemId){
      
      filterShelfObj.shelfItemId = value.shelfItemId
    }
    if(value.stockId){
      filterShelfObj.stockId = value.stockId
    }
    if(value.shelfQuantity){
      filterShelfObj.shelfQuantity = { gt: value.shelfQuantity - 1 }
    }
    console.log(filterShelfObj)
    console.log(filterStockObj)
    const searchResult = await prisma.productShelf.findMany({
      where: {
        AND: [
          filterShelfObj,
          {
            productStock: {
              AND: [
                filterStockObj,
                {
                  OrderList: { Supplier: { companyId: +req.user.companyId } },
                },
              ],
            },
          },
        ],
      },
      include: {
        productStock: {
          select: {
            productName: true,
            stockQuantity: true,
            expirationDate: true,
            pricePerUnit: true,
          },
        },
      },
      orderBy : {shelfItemId : "desc"}
    });
    res.json({ searchResult });
  } catch (error) {
    next(error);
  }
};