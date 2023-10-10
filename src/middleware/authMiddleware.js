const craeteError = require("../utils/craeteError");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prisma");

exports.authentication = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || authorization.split("Bearer") === "") {
      return next(craeteError("You are not authorized", 401));
    }
    const token = authorization.split("Bearer ")[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });
    if (!user) {
      return next(craeteError("You are not authorized", 401));
    }
    delete user.password;
    req.user = user;    
    next();
  } catch (error) {
    next(error);
  }
};
