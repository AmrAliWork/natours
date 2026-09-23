module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// I create a function that takes an async function and returns an Express middleware function. The middleware executes the async function and passes any errors to the global error handler.
