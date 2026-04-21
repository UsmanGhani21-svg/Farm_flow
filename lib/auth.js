const { SignJWT, jwtVerify } = require('jose');

async function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'farm-dashboard-secret-key-2024');
}

async function signToken(payload) {
  const secret = await getSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

async function verifyToken(token) {
  try {
    const secret = await getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

async function getUser(req) {
  const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

module.exports = { signToken, verifyToken, getUser };
