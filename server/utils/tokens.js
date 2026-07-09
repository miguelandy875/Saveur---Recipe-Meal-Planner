import jwt from 'jsonwebtoken';

export function createToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function serializeUser(user) {
  return {
    uid: user._id.toString(),
    displayName: user.name,
    email: user.email,
    role: user.role,
  };
}
