const craeteError = require("../../utils/craeteError");
const jwt = require("jsonwebtoken");
const prisma = require("../../models/prisma");

exports.adminAuthentication = async (req, res, next) => {
  const { userRole } = req.user;
  if (userRole !== "admin") {
    return next(craeteError("You are not authorized", 401));
  }
  next();
};
