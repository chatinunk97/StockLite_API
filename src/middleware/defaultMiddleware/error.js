module.exports = errorMiddleware = (error, req, res, next) => {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }
    res.status(error.statusCode || 500).json({ message: error.message });
  };
  