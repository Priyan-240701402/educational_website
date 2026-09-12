function notFound(req, res) { res.status(404).json({ success:false, message:`Route ${req.method} ${req.originalUrl} was not found.` }); }
function errorHandler(error, req, res, next) { console.error(error); res.status(error.statusCode || 500).json({ success:false, message:error.statusCode ? error.message : 'An unexpected server error occurred.' }); }
module.exports = { notFound, errorHandler };
