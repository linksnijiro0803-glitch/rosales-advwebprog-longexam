const User = require("../models/userModel");
const { HttpStatus } = require("../config/constants");
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating tokens

const allowedRoles = ["Customer", "Admin"];

const buildNameFields = (name, email) => {
  const nameParts = name.trim().split(/\s+/);

  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" ") || nameParts[0],
    username: email,
  };
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude the password field
    res.json({ users });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const registerUserWithRole = async (req, res, roleOverride = null) => {
  try {
    const { name, email, password, role } = req.body;
    const userRole = roleOverride || role;

    if (!name || !email || !password) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Name, email, and password are required",
      });
    }

    if (userRole && !allowedRoles.includes(userRole)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Role must be either "Customer" or "Admin"',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      ...(userRole && { role: userRole }),
      ...buildNameFields(name, email),
    });

    res.status(HttpStatus.CREATED).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const registerUser = (req, res) => registerUserWithRole(req, res, "Customer");

const createUser = (req, res) => registerUserWithRole(req, res);

const updateUser = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "Admin";
    const isOwner = req.user?.id?.toString() === req.params.id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: "Access denied",
      });
    }

    const updates = isAdmin
      ? { ...req.body }
      : ["name", "email"].reduce((allowed, field) => {
          if (req.body[field] !== undefined) {
            allowed[field] = req.body[field];
          }
          return allowed;
        }, {});

    // Check if the password is being updated
    if (updates.password) {
      // Hash the new password
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update the user with the new data
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    // Check if the user is active
    if (!user.isActive) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "JWT secret is not configured",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Login successful', 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, registerUser, updateUser, deleteUser, loginUser };
