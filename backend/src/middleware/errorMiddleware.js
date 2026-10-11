export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}
export function errorHandler(err, _req, res, _next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ message: err.message || 'Something went wrong.' });
}
