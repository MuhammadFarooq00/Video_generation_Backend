import { signupService, loginService } from '../Services/AuthService.mjs';

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = await signupService(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await loginService(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
