const prisma = require("../models/prisma");
const createError = require("../utils/createError");
const {
  USER_ADMIN,
  USER_EMPLOYEE,
  USER_SUPERVISOR,
} = require("../config/constrants");
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
    value.userRole = USER_ADMIN;
    // Delete Company Name , already created
    delete value.companyName;
    value.password = await bcrypt.hash(value.password, 12);
    const createUserResult = await prisma.user.create({
      data: value,
    });
    res.json({ createUserResult });
  } catch (error) {
    next(error);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { value, error } = LoginSchema.validate(req.body, {
      abortEarly: false,
    });
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
    const payload = { userId: existUser.userId };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "poq[jer;qok109;kd/.",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    delete existUser.password;
    if (!existUser.active) {
      return next(
        createError(
          "Your account is deactivated please contact your Admin",
          400
        )
      );
    }
    res.json({ accessToken: token, user: existUser });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
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
      select: {
        userId: true,
        username: true,
        createdAt: true,
        companyId: true,
        firstName: true,
        lastName: true,
        userRole: true,
      },
    });

    res.json({ createUserresult });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  res.json(req.user);
};
exports.filterUser = async (req, res, next) => {
  try {
    const filterObj = {};
    for (filterKey in req.query) {
      if (req.query[filterKey]) {
        filterObj[filterKey] = { startsWith: "%" + req.query[filterKey] };
      }
    }
    //Add userId filter manually since it's a INT
    if (filterObj.userId) {
      filterObj.userId = +req.query.userId;
    }

    //Add filter for userRole and admin's companyID
    if (filterObj.userRole) {
      if (
        filterObj.userRole === USER_EMPLOYEE ||
        filterObj.userRole === USER_SUPERVISOR
      ) {
        filterObj.userRole = req.query.userRole;
      } else {
        delete filterObj.userRole;
      }
    }

    //This is a must have
    filterObj.companyId = req.user.companyId;
    console.log(filterObj);
    const searchResult = await prisma.user.findMany({
      where: {
        AND: filterObj,
      },
      select: {
        userId: true,
        username: true,
        createdAt: true,
        companyId: true,
        firstName: true,
        lastName: true,
        userRole: true,
        active: true,
      },
    });
    res.json({ searchResult });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const deleteUser = +req.query.userId;
    const companyId = +req.user.companyId;
    if (deleteUser === +req.user.userId) {
      return next(createError("You cannot delete your own account", 400));
    }
    const foundUser = await prisma.user.findFirst({
      where: {
        AND: [{ userId: deleteUser }, { companyId: companyId }],
      },
    });
    if (!foundUser) {
      return next(createError("No user found", 400));
    }

    const deleteResult = await prisma.user.delete({
      where: {
        userId: foundUser.userId,
      },
    });
    res.json({ message: `User : ${deleteResult.username} Deleted` });
  } catch (error) {
    if (
      error.message.includes(
        "Foreign key constraint failed on the field: `userId`"
      )
    ) {
      return next(
        createError(
          "Cannot delete user due to this user is linked to transactions such as Order , Transactions",
          400
        )
      );
    }
    next(error);
  }
};

exports.editUser = async (req, res, next) => {
  try {
    const editUser = req.body;
    const companyId = +req.user.companyId;
    const foundUser = await prisma.user.findFirst({
      where: {
        AND: [{ userId: +editUser.userId }, { companyId: companyId }],
      },
    });
    if (!foundUser) {
      return next(createError("No user found", 400));
    }
    // delete editUser.userId;
    delete editUser.username;
    delete editUser.createdAt;

    //Change active to boolean
    if (editUser.active === "true") {
      editUser.active = true;
    } else {
      editUser.active = false;
    }

    //Prevent from deactivating Admin
    if (editUser.userRole === USER_ADMIN && !editUser.active) {
      return next(createError("You cannot deactivate Admin user", 400));
    }
    console.log(editUser);
    await prisma.user.update({
      where: { userId: +editUser.userId },
      data: editUser,
    });
    res.json({ message: "User information updated" });
  } catch (error) {
    next(error);
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const searchResult = await prisma.transaction.findMany({
      where: { User: { companyId: +req.user.companyId } },
      include: { User: { select: { username: true } } },
    });
    res.json({ searchResult });
  } catch (error) {
    next(error);
  }
};
