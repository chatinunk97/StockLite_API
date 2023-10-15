module.exports = (message, statusCode) => {
  const newError = new Error(message);
  newError.statusCode = statusCode;
  return newError;
};
