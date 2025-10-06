import User from '../Models/User.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signupService = async (username, email, password) => {
  const exist = await User.findOne({ email });
  if (exist) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();

  return { message: 'Signup successful' };
};

export const loginService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET
    , { expiresIn: '1h' });

  return {
    token,
    user: { id: user._id, username: user.username, email: user.email }
  };
};
