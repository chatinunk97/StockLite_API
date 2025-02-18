const createError = require("./createError");

exports.checkDemo = (userId, next) => {
  if (userId === 10007) {
    return true;
  }
  return false;
};
