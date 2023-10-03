const prisma = require("../models/prisma");
const createError = require("../utils/craeteError");
const { registerComapnySchema } = require("../validators/userValidator");

exports.registerCompany = async (req, res, next) => {
  const { companyName, companyLogo } = req.body;
  try {
    const { value, error } = registerComapnySchema.validate(req.body);
    if (error) {
      return next(createError(error.message, 400));
    }
    const result = await prisma.companyProfile.create({
      data: value,
    });
    res.json({ message: "Completed", data: { result } });
  } catch (error) {
    next(error);
  }
};

//This middleware is an idea for filtering multiple filter
// and can handle undefined filter get all company profile might not be useful in the real use case tho
exports.getCompany = async (req, res, next) => {
  const filterObj = {};
  const { companyId, companyName } = req.query;
  if(companyId){
    filterObj.companyId = (+companyId)
  }
  if(companyName){
    filterObj.companyName = {startsWith : companyName}
  }
  try {
    const result = await prisma.companyProfile.findMany({
      where: {
        AND: filterObj,
      },
    });
    res.json({ message: "Completed", data: { result } });
  } catch (error) {
    next(error);
  }
};
