exports.authentication = async (req, res, next) => {
  try {
    console.log("This request gone through Authenticate");
    next();
  } catch (error) {
    next(error)
  }
};
 