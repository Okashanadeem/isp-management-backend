import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Your session token is invalid or expired' });
  }
};

export default protect;


export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || (!user.role && !user.roles)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isAllowed = rolesFromToken.some((role) => allowedRoles.includes(role));
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    next();
  };
};