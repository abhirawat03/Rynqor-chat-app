/**
 * Express 5.x compliant NoSQL Injection Sanitization Middleware.
 * Replaces keys starting with '$' or containing '.' recursively.
 * Mutates objects in-place to avoid Express 5.x read-only getter reassignment crashes on req.query.
 */
const sanitize = (val) => {
  if (val && typeof val === "object") {
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (typeof val[i] === "object" && val[i] !== null) {
          sanitize(val[i]);
        }
      }
    } else {
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          if (key.startsWith("$") || key.includes(".")) {
            delete val[key];
          } else if (typeof val[key] === "object" && val[key] !== null) {
            sanitize(val[key]);
          }
        }
      }
    }
  }
  return val;
};

export const mongoSanitize = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};
