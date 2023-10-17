const prisma = require("../models/prisma");
const createError = require("../utils/createError");
const {
  ValidateSupplierInput,
  ValidateSupplierFilter,
  ValidateSupplierId,
  CheckSupplier,
  checkStartEndDate,
  checkCreateOrder,
} = require("../validators/wmsValidator");
const Joi = require("joi");

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
    const { value, error } = ValidateSupplierId(req.query.supplierId);
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
    console.log(req.query);
    const filterObj = { receiveDate: {} };
    // Add Order ID manually since it's INT
    if (req.query.orderId) {
      filterObj.orderId = +req.query.orderId;
    }
    // Add Supplier ID manually since it's INT
    if (req.query.supplierId) {
      filterObj.supplierId = +req.query.supplierId;
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
        AND: [
          filterObj,
          {
            receiveDate: receiveDateFilter,
          },
        ],
      },
      include: {
        Supplier: {
          select: { companyId: true },
        },
      },
    });
    res.json({ searchResult });
  } catch (error) {
    return next(error);
  }
};
exports.editOrder =  async(req,res,next)=>{
  try {
    res.json({message : "Edit Order reached"})
  } catch (error) {
    next(error)
  }
}