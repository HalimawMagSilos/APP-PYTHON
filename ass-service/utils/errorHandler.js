export const notFound = (req, res, next) => {
  const e = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(e);
};

export const errorHandler = (err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
};
