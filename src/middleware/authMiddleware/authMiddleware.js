const createError = require("../../utils/createError");
const jwt = require("jsonwebtoken");
const prisma = require("../../models/prisma");

exports.authentication = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || authorization.split("Bearer ")[1] === "") {
      return next(createError("You are not authorized", 401));
    }
    const token = authorization.split("Bearer ")[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });
    if (!user) {
      return next(createError("You are not authorized", 401));
    }
    delete user.password;
    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      error.statusCode = 401;
    }
    next(error);
  }
};
