const createError = require("../../utils/createError");
const { USER_ADMIN, USER_SUPERVISOR } = require("../../config/constrants");

exports.supervisorAuthentication = async (req, res, next) => {
  const { userRole } = req.user;
  if (userRole !== USER_ADMIN && userRole !== USER_SUPERVISOR) {
    return next(createError("You are not authorized", 401));
  }
  next();
};