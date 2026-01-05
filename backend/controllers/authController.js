// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashed,
    });

    return res.status(201).json({
      message: "User registered successfully",
      userid: newUser._id,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const existing = await User.findOne({ username });
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }
    const check = await bcrypt.compare(password, existing.password);
    if (!check) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userid: existing._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,   
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error during logout" });
  }
};

export const getme = async (req, res) => {
  try {
    const token = req.cookies.token;
    if(!token){
        return res.status(404).json({message : "login required"});
    }
    const decode = jwt.verify(token , process.env.SECRET_KEY);
    const userid = decode.userid;
    const user = await User.findById(userid).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      userid : user._id,
      username : user.username,
      email : user.email,
      message: "User details fetched successfully",
    });

  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: "Server error fetching user details" });
  }
};
