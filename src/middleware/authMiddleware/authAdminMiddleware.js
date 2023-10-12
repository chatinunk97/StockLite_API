const craeteError = require("../../utils/craeteError");


exports.adminAuthentication = async (req, res, next) => {
  const { userRole } = req.user;
  if (userRole !== "admin") {
    return next(craeteError("You are not authorized", 401));
  }
  next();
};
