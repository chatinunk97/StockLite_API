const prisma = require("../models/prisma");
const createError = require("../utils/createError");
const {
  ValidateSupplierInput,
  ValidateSupplierFilter,
  ValidateSupplierId,
} = require("../validators/wmsValidator");

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
    const result = await prisma.supplier.create({
      data: value,
    });
    res.json({ message: result });
  } catch (error) {
    next(error);
  }
};

exports.filterSupplier = async (req, res, next) => {
  try {
    const { value, error } = ValidateSupplierFilter(req.query);
    console.log(value, error);
    const filterObj = {};
    for (filterKey in req.query) {
      if (req.query[filterKey]) {
        filterObj[filterKey] = { startsWith: "%" + req.query[filterKey] };
      }
    }
    //Add userId filter manually since it's a INT
    if (filterObj.supplierId) {
      filterObj.supplierId = +req.query.supplierId;
    }
    //Add user's CompanyID
    filterObj.companyId = +req.user.companyId;
    const searchResul1t = await prisma.supplier.findMany({
      where: filterObj,
    });
    return res.json({ searchResul1t });
  } catch (error) {
    next(error);
  }
};

exports.editSupplier = async (req, res, next) => {
  try {
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
    const updatedInfo = await prisma.supplier.update({
      where: { supplierId: existSupplier.companyId },
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
    res.json({ message: `Supplier : ${deleteResult.supplierName} Deleted` });
  } catch (error) {
    next(error);
  }
};
