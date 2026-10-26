import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError, asyncHandler } from "../middleware/error.js";
import { signToken } from "../middleware/auth.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw new AppError(409, "An account with that email already exists");
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), providers: ["password"] });
  res.status(201).json({ token: signToken(user._id), user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  if (user && !user.passwordHash) throw new AppError(401, `This account uses ${user.providers.join(" / ")} sign-in. Use that button instead.`);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, "Incorrect email or password");
  res.json({ token: signToken(user._id), user });
});

export const me = (req, res) => res.json({ user: req.user });
