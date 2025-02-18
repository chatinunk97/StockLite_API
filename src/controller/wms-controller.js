const prisma = require("../models/prisma");
const { checkDemo } = require("../utils/checkDemo");
const createError = require("../utils/createError");
const {
  ValidateSupplierInput,
  ValidateSupplierFilter,
  ValidateIds,
  CheckSupplier,
  checkCreateOrder,
  ChecExistOrder,
  checkEditOrder,
  checkCreateStock,
  checkOrderFilter,
  checkStockFilter,
  checkExistStock,
  checkStockEdit,
  checkShelfAdd,
  checkShelfFilter,
  CheckExistShelf,
} = require("../validators/wmsValidator");

/// Spplier ///
exports.createSupplier = async (req, res, next) => {
  try {
    const data = req.body;

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));

    data.companyId = +req.user.companyId;
    const { value, error } = ValidateSupplierInput(data);
    if (error) {
      return next(error);
    }
    const existSupplier = await prisma.supplier.findFirst({
      where: {
        AND: [
          { companyId: data.companyId },
          { supplierName: data.supplierName },
        ],
      },
    });
    if (existSupplier) {
      return next(createError("Supplier with this name already exist", 400));
    }
    const createResult = await prisma.supplier.create({
      data: value,
    });
    res.json({ createResult });
  } catch (error) {
    next(error);
  }
};

exports.filterSupplier = async (req, res, next) => {
  try {
    const { value, error } = ValidateSupplierFilter(req.query);
    if (error) {
      return next(error);
    }
    const filterObj = {};
    for (filterKey in value) {
      if (value[filterKey]) {
        filterObj[filterKey] = { startsWith: "%" + req.query[filterKey] };
      }
    }
    //Add userId filter manually since it's a INT
    if (filterObj.supplierId) {
      filterObj.supplierId = +req.query.supplierId;
    }
    //Add user's CompanyID
    filterObj.companyId = +req.user.companyId;
    const searchResult = await prisma.supplier.findMany({
      where: filterObj,
    });
    return res.json({ searchResult });
  } catch (error) {
    next(error);
  }
};

exports.editSupplier = async (req, res, next) => {
  try {
    delete req.body.createdAt;
    delete req.body.updatedAt;

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));

    const { value, error } = ValidateSupplierInput(req.body);
    if (error) {
      return next(error);
    }
    const existSupplier = await prisma.supplier.findFirst({
      where: {
        AND: [
          { supplierId: value.supplierId },
          { companyId: +req.user.companyId },
        ],
      },
    });
    if (!existSupplier) {
      return next(createError("Supplier not found", 400));
    }
    delete value.supplierId;
    delete value.companyId;
    console.log(existSupplier);
    const updatedInfo = await prisma.supplier.update({
      where: { supplierId: existSupplier.supplierId },
      data: value,
    });
    res.json({ data: updatedInfo });
  } catch (error) {
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const { value, error } = ValidateIds(req.query.supplierId);

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));
    if (error) {
      return next(error);
    }
    const deleteSupplier = value;
    const companyId = +req.user.companyId;

    const foundSupplier = await prisma.supplier.findFirst({
      where: {
        AND: [{ supplierId: deleteSupplier }, { companyId }],
      },
    });
    if (!foundSupplier) {
      return next(createError("No supplier found", 400));
    }
    // Check if there's a order depening on this supplier
    const dependence = await prisma.orderList.findMany({
      where: {
        supplierId: deleteSupplier,
      },
    });
    if (dependence.length) {
      const orderId = [];
      for (const iterator of dependence) {
        orderId.push(iterator.orderId);
      }
      const orderText = orderId.join(",");
      return next(
        createError(
          `Cannot delete this supplier because Order number : ${orderText} are made by this Supplier`,
          400
        )
      );
    }
    const deleteResult = await prisma.supplier.delete({
      where: {
        supplierId: deleteSupplier,
      },
    });
    res.json({ deleteResult });
  } catch (error) {
    next(error);
  }
};

// Order ///
exports.createOrder = async (req, res, next) => {
  try {
    const data = req.body;
    data.userId = req.user.userId;

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));

    const { value, error } = checkCreateOrder(data);
    if (error) {
      return next(error);
    }

    const existSupplier = await CheckSupplier(
      req.user.companyId,
      value.supplierId
    );
    if (!existSupplier) {
      return next(createError("Supplier not found", 404));
    }
    const createResult = await prisma.orderList.create({
      data: value,
    });
    res.json({ createResult });
  } catch (error) {
    next(error);
  }
};
exports.filterOrder = async (req, res, next) => {
  try {
    const { value, error } = checkOrderFilter(req.query);
    if (error) {
      return next(error);
    }
    const filterObj = { receiveDate: {} };
    // Add Order ID manually since it's INT
    if (req.query.orderId) {
      filterObj.orderId = +req.query.orderId;
    }
    // Add Supplier ID manually since it's INT
    if (req.query.supplierId) {
      filterObj.supplierId = +req.query.supplierId;
    }
    let usernameFilter = {};
    if (req.query.username) {
      usernameFilter = { username: { startsWith: "%" + req.query.username } };
    }
    if (req.query.sumPrice) {
      filterObj.sumPrice = { gt: +req.query.sumPrice };
    }
    const receiveDateFilter = {};
    if (req.query.startDate) {
      receiveDateFilter.gte = new Date(req.query.startDate); // Start of date range
    }
    if (req.query.endDate) {
      receiveDateFilter.lte = new Date(req.query.endDate); // End of date range
    }
    const searchResult = await prisma.orderList.findMany({
      where: {
        Supplier: {
          companyId: +req.user.companyId,
        },
        User: usernameFilter,
        AND: [
          filterObj,
          {
            receiveDate: receiveDateFilter,
          },
        ],
      },
      orderBy: {
        orderId: "desc",
      },
      include: {
        Supplier: {
          select: { supplierId: true, supplierName: true },
        },
        User: { select: { username: true } },
      },
    });
    res.json({ searchResult });
  } catch (error) {
    return next(error);
  }
};
exports.editOrder = async (req, res, next) => {
  try {
    const editData = {};
    const { orderId, sumPrice, receiveDate } = req.body;
    editData.orderId = orderId;
    editData.sumPrice = sumPrice;
    editData.receiveDate = receiveDate;
    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));
    const { value, error } = checkEditOrder(editData);
    if (error) {
      return next(error);
    }
    const existOrder = await prisma.orderList.findFirst({
      where: { orderId: value.orderId },
    });
    if (!existOrder) {
      return next(createError("no order found", 400));
    }

    for (i in value) {
      if (!value[i]) {
        delete value[i];
      }
    }
    const newOrderData = { ...existOrder, ...value };
    const editResult = await prisma.orderList.update({
      where: {
        orderId: newOrderData.orderId,
      },
      data: newOrderData,
    });
    res.json({ editResult });
  } catch (error) {
    next(error);
  }
};
exports.deleteOrder = async (req, res, next) => {
  try {
    const { value, error } = ValidateIds(req.query.orderId);
    if (error) {
      return next(error);
    }
    const deleteOrder = await ChecExistOrder(value);
    if (!deleteOrder) {
      return next(createError("No order found", 400));
    }

    //Search for associated stock
    const associatedStock = await prisma.productStock.findFirst({
      where: { orderId: deleteOrder.orderId },
    });
    if (associatedStock)
      return next(
        createError(
          `Cannot delete this Order because Stock number : ${associatedStock.stockId} is linked to this Order`,
          400
        )
      );

    const deletedOrder = await prisma.orderList.delete({
      where: { orderId: deleteOrder.orderId },
    });
    res.json({ deletedOrder });
  } catch (error) {
    next(error);
  }
};

//Stock   #note 1 Order has many stock//
exports.createStock = async (req, res, next) => {
  try {
    console.log(req.body);
    const { value, error } = checkCreateStock(req.body);

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));
    if (error) {
      return next(error);
    }
    if (!value.expirationDate) {
      delete value.expirationDate;
    }
    const checkOrderValid = await prisma.orderList.findFirst({
      where: {
        AND: [
          { Supplier: { companyId: +req.user.companyId } },
          { orderId: value.orderId },
        ],
      },
    });
    if (!checkOrderValid) {
      return next(createError("No orderID found", 400));
    }
    const existStock = await prisma.productStock.findFirst({
      where: {
        AND: [{ orderId: value.orderId }, { productName: value.productName }],
      },
    });
    if (existStock) {
      return next(
        createError(
          `There's already stock with name ${value.productName} for Order Number ${value.orderId}`
        )
      );
    }
    const createResult = await prisma.productStock.create({
      data: value,
    });
    return res.json({ createResult });
  } catch (error) {
    next(error);
  }
};
exports.filterStock = async (req, res, next) => {
  try {
    const { value, error } = checkStockFilter(req.query);
    if (error) {
      return next(error);
    }
    const filterObj = {};

    // Validate INT input
    if (value.stockId) {
      filterObj.stockId = value.stockId;
    }
    if (value.stockQuantity) {
      filterObj.stockQuantity = { gt: value.stockQuantity - 1 };
    }
    if (value.pricePerUnit) {
      filterObj.pricePerUnit = { gt: value.pricePerUnit - 1 };
    }
    if (value.productName) {
      filterObj.productName = { startsWith: "%" + value.productName };
    }
    if (value.supplierName) {
      filterObj.OrderList = {
        Supplier: { supplierName: { startsWith: "%" + value.supplierName } },
      };
    }
    if (value.expirationDate) {
      filterObj.expirationDate = { lt: value.expirationDate };
    }

    const result = await prisma.productStock.findMany({
      where: {
        AND: [
          filterObj,
          { OrderList: { Supplier: { companyId: +req.user.companyId } } },
        ],
      },
      include: {
        OrderList: {
          select: {
            Supplier: { select: { supplierId: true, supplierName: true } },
          },
        },
      },
    });
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

exports.deleteStock = async (req, res, next) => {
  try {
    const { value, error } = ValidateIds(req.query.stockId);

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));
    if (error) {
      return next(error);
    }
    const deleteStock = await checkExistStock(value);
    if (!deleteStock) {
      return next(createError("No stock found", 400));
    }

    const associatedShelf = await prisma.productShelf.findFirst({
      where: { stockId: value },
    });
    if (associatedShelf)
      return next(
        createError(
          `Cannot delete this Stock because Shelf number : ${associatedShelf.shelfItemId} is linked to this Stock`,
          400
        )
      );

    const deletedStock = await prisma.productStock.delete({
      where: { stockId: value },
    });
    res.json({ deletedStock });
  } catch (error) {
    next(error);
  }
};
exports.editStock = async (req, res, next) => {
  try {
    const editData = {};
    const {
      stockId,
      productName,
      stockQuantity,
      pricePerUnit,
      expirationDate,
    } = req.body;
    editData.stockId = stockId;
    editData.productName = productName;
    editData.stockQuantity = stockQuantity;
    editData.pricePerUnit = pricePerUnit;
    editData.expirationDate = expirationDate;
    const { value, error } = checkStockEdit(editData);
    if (error) {
      return next(error);
    }
    console.log(value);
    const existStock = await prisma.productStock.findFirst({
      where: { stockId: value.stockId },
    });
    if (!existStock) {
      return next(createError("no stock found", 400));
    }
    for (i in value) {
      if (!value[i]) {
        delete value[i];
      }
    }
    const newStockData = { ...existStock, ...value };
    const editResult = await prisma.productStock.update({
      where: {
        stockId: newStockData.stockId,
      },
      data: newStockData,
    });

    res.json({ editResult });
  } catch (error) {
    next(error);
  }
};

//Shelf # note 1 Stock to 1 Shelf
exports.createShelf = async (req, res, next) => {
  try {
    const { value, error } = ValidateIds(req.body.stockId);

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));
    if (error) {
      return next(error);
    }
    console.log(value, error);
    const existingStock = await prisma.productStock.findFirst({
      where: { stockId: value },
    });
    if (!existingStock) {
      return next(createError("No stock found", 400));
    }
    const existingShelf = await prisma.productShelf.findFirst({
      where: { stockId: value },
    });
    if (existingShelf) {
      return next(
        createError(
          "The stock already has a shelf record please check again",
          400
        )
      );
    }
    const createResult = await prisma.productShelf.create({
      data: {
        stockId: value,
      },
    });
    res.json({ createResult });
  } catch (error) {
    next(error);
  }
};

exports.addShelfCount = async (req, res, next) => {
  try {
    const { value, error } = checkShelfAdd(req.body);
    if (error) {
      return next(error);
    }
    if (!value.shelfAddQuantity || value.shelfAddQuantity < 0) {
      return next(createError("Please input a number more than 0"));
    }
    const existingShelf = await prisma.productShelf.findFirst({
      where: { shelfItemId: value.shelfItemId },
    });
    if (!existingShelf) {
      return next(createError("No shelf Found "));
    }
    const existingStock = await prisma.productStock.findFirst({
      where: { stockId: existingShelf.stockId },
    });
    if (!existingStock) {
      return next(createError("No stock Found "));
    }

    //Add to shelf and subtract from stock
    if (existingStock.stockQuantity < value.shelfAddQuantity) {
      return next(createError("Insufficient Stock quantity", 400));
    }
    const updatedResult = await prisma.productShelf.update({
      where: { shelfItemId: existingShelf.shelfItemId },
      data: {
        shelfQuantity: existingShelf.shelfQuantity + value.shelfAddQuantity,
      },
    });
    const updatedStock = await prisma.productStock.update({
      where: { stockId: existingStock.stockId },
      data: {
        stockQuantity: existingStock.stockQuantity - value.shelfAddQuantity,
        refillCount: ++existingStock.refillCount,
      },
    });
    res.json({ updatedResult, updatedStock });
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
    if (value.stockQuantity) {
      filterStockObj.stockQuantity = { gt: value.stockQuantity - 1 };
    }
    if (value.expirationDate) {
      filterStockObj.expirationDate = { lt: value.expirationDate };
    }

    //Filter for productShelf table
    const filterShelfObj = {};
    if (value.shelfItemId) {
      filterShelfObj.shelfItemId = value.shelfItemId;
    }
    if (value.stockId) {
      filterShelfObj.stockId = value.stockId;
    }
    if (value.shelfQuantity) {
      filterShelfObj.shelfQuantity = { gt: value.shelfQuantity - 1 };
    }
    console.log(filterShelfObj);
    console.log(filterStockObj);
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
      orderBy: { shelfItemId: "desc" },
    });
    res.json({ searchResult });
  } catch (error) {
    next(error);
  }
};

exports.deleteShelf = async (req, res, next) => {
  try {
    const { value, error } = ValidateIds(req.query.shelfItemId);

    if (checkDemo(+req.user.userId))
      return next(createError("Demo-user action is prohibited", 405));
    if (error) {
      return next(error);
    }
    const deleteShelf = await CheckExistShelf(value);
    if (!deleteShelf) {
      return next(createError("No shelf found", 400));
    }

    const deletedShelf = await prisma.productShelf.delete({
      where: { shelfItemId: value },
    });
    res.json({ deletedShelf });
  } catch (error) {
    next(error);
  }
};
