const createError = require("../../utils/createError");


exports.adminAuthentication = async (req, res, next) => {
  const { userRole } = req.user;
  if (userRole !== "admin") {
    return next(createError("You are not authorized", 401));
  }
  next();
};
