const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { userId: user.id, userProfil: user.profil };
  const secretKey = '4012b5adf397d50459aebc1eb009e38b6b82256246bf2b64de300132dd3ef053'; 
  return jwt.sign(payload, secretKey);
};

const verifyToken = (token) => {
  const secretKey = '4012b5adf397d50459aebc1eb009e38b6b82256246bf2b64de300132dd3ef053'; 
  return jwt.verify(token, secretKey);
};

const authenticateToken = (requiredAccess) => (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Missing Token' });
  }

  try {
    const decodedToken = verifyToken(token.replace('Bearer ', ''));
    console.log('Decoded Token:', decodedToken);
    req.user = decodedToken;

    // Vérifier si le profil de l'utilisateur a l'accès requis
    if (!requiredAccess.includes(req.user.userProfil)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient Permissions' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
  }
};

module.exports = { generateToken, verifyToken, authenticateToken };