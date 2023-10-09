const prisma = require("../models/prisma");
const createError = require("../utils/craeteError");
const {
  registerAdminSchema,
  registerUserSchema,
  LoginSchema,
  checkExistingUser,
  checkExistingCompany,
} = require("../validators/userValidator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res, next) => {
  try {
    const { value, error } = registerAdminSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    if (await checkExistingUser(value)) {
      return next(createError(`The username or email is already in use`, 400));
    }
    if (await checkExistingCompany(value)) {
      return next(createError(`The Company name is already in use`, 400));
    }
    const companyCreateResult = await prisma.companyProfile.create({
      data: {
        companyName: value.companyName,
      },
    });

    // Add the newly created company Id to the input value Obj
    value.companyId = companyCreateResult.companyId;
    value.userRole = "admin";
    // Delete Company Name , already created
    delete value.companyName;
    value.password = await bcrypt.hash(value.password, 12);
    const createUserResult = await prisma.user.create({
      data: value,
    });
    res.json({createUserResult });
  } catch (error) {
    next(error);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { value, error } = registerUserSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    if (await checkExistingUser(value)) {
      return next(createError(`The username or email already in use`, 400));
    }
    if (!(await checkExistingCompany(value))) {
      return next(createError(`Company not found`, 400));
    }
    value.password = await bcrypt.hash(value.password, 12);
    const createUserresult = await prisma.user.create({
      data: value,
    });
    
    res.json({ createUserresult});
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { value, error } = LoginSchema.validate(req.body);
    if (error) {
      next(error);
    }
    const existUser = await checkExistingUser(value);
    if (!existUser) {
      return next(createError("Invalid Credential", 404));
    }
    const checkPassword = await bcrypt.compare(
      value.password,
      existUser.password
    );
    if (!checkPassword) {
      return next(createError("Invalid Credential", 404));
    }
    //Check credentail all OK from now
    delete existUser.password;
    const payload = existUser;
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "poq[jer;qok109;kd/.",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.json({ accessToken: token });
  } catch (error) {
    next(error);
  }
};

//This middleware is an idea for filtering multiple filter
// and can handle undefined filter get all company profile might not be useful in the real use case tho
exports.getCompany = async (req, res, next) => {
  const filterObj = {};
  const { companyId, companyName } = req.query;
  if (companyId) {
    filterObj.companyId = +companyId;
  }
  if (companyName) {
    filterObj.companyName = { contains: companyName };
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
