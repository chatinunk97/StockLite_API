const prisma = require("../models/prisma");
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
} = require("../validators/wmsValidator");

/// Spplier ///
exports.createSupplier = async (req, res, next) => {
  try {
    const data = req.body;
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
      console.log(dependence);
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
      receiveDateFilter.lte = new Date(req.query.endDate); // Start of date range
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
    const newOrderData = { ...existOrder, ...value };
    const editResult = await prisma.orderList.update({
      where: {
        orderId: newOrderData.orderId,
      },
      data: newOrderData,
    });
    console.log(editResult);
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
    const { value, error } = checkCreateStock(req.body);
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
    const result = await prisma.productStock.findMany({
      where: {
        AND: [{ OrderList: { Supplier: { companyId: +req.user.companyId } } }],
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
