// backend/controllers/authController.js
const User = require("../models/user");
const Institution = require("../models/Institution");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Admin Registration ---
exports.registerAdmin = async (req, res) => {
  console.log("Admin register endpoint hit!");
  const { name, email, password, institutionName } = req.body;

  if (!name || !email || !password || !institutionName) {
    return res.status(400).json({ msg: "Please provide all required fields." });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    let institution = await Institution.findOne({ name: institutionName });
    if (institution) {
      return res.status(400).json({ msg: "An institution with this name already exists." });
    }
    console.log("Creating new institution...");

    institution = new Institution({ name: institutionName });
    await institution.save(); // 'collegeCode' is auto-generated
    console.log("Institution created:", institution._id, "Code:", institution.collegeCode);

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    user = new User({
      name, email, password: hashedPassword,
      role: "admin",
      isVerified: false, verificationCode,
      institution: institution._id,
      // Admin does not have currentSemester or department
    });

    await user.save();
    console.log("Admin user created and linked to institution.");

    try {
        await sendEmail(email, "Verify your EduFeedback account", 
            `Your verification code is: ${verificationCode}. \n\n` +
            `Your unique College ID for students to register is: ${institution.collegeCode}`
        );
        console.log("Verification email with college code sent.");
    } catch (emailError) {
        console.error("!!! Email Sending Failed (but user was created) !!!:", emailError);
    }
    
    res.status(201).json({ 
        msg: "Account created. Check your email to verify.",
        collegeCode: institution.collegeCode // Send code back to frontend
    });

  } catch (err) {
    console.error("!!! Register Admin Error Caught !!!:", err);
    res.status(500).json({ msg: "Server error during admin registration." });
  }
};

// --- Student Registration ---
exports.registerStudent = async (req, res) => {
  console.log("Student register endpoint hit!");
  const { name, email, password, collegeCode, currentSemester, department } = req.body;

  if (!name || !email || !password || !collegeCode || !currentSemester || !department) {
    return res.status(400).json({ msg: "Please provide all required fields." });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Find institution by the unique college code
    const institution = await Institution.findOne({ collegeCode: collegeCode });
    if (!institution) {
      return res.status(400).json({ msg: "Invalid College Code. Please check the code." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    user = new User({
      name, email, password: hashedPassword,
      role: "student",
      isVerified: false, verificationCode,
      institution: institution._id,
      currentSemester: currentSemester,
      department: department
    });

    await user.save();
    console.log("Student user created and linked to:", institution.name);

    try {
        await sendEmail(email, "Verify your EduFeedback account", `Your verification code is: ${verificationCode}`);
        console.log("Verification email sent.");
    } catch (emailError) {
        console.error("!!! Email Sending Failed (but user was created) !!!:", emailError);
    }
    
    res.status(201).json({ msg: "Account created. Check your email to verify." });
    
  } catch (err) {
    console.error("!!! Register Student Error Caught !!!:", err);
    res.status(500).json({ msg: "Server error during student registration." });
  }
};

exports.verifyEmail = async (req, res) => {
  console.log("\n--- Verify Email endpoint hit! ---");
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ msg: "Invalid code or user" });
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
    res.json({ msg: "Email verified. You can now log in." });
  } catch (err) {
    console.error("!!! Verify Error Caught !!!:", err);
    res.status(500).json({ msg: "Server error during verification" });
  }
};

exports.login = async (req, res) => {
  console.log("\n--- Login endpoint hit! ---");
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "No account found" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ msg: "Email not verified" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Wrong password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, institution: user.institution },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, role: user.role, msg: "Login successful" });
  } catch (err) {
    console.error("!!! Login Error Caught !!!:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
};

exports.forgotPassword = async (req, res) => {
  console.log("\n--- Forgot Password endpoint hit! ---");
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ msg: "User not found" });
    }
    const resetCode = generateCode();
    user.resetToken = resetCode;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendEmail(
      email, "EduFeedback Password Reset",
      `Your password reset code is: ${resetCode}`
    );
    res.json({ msg: "Reset code sent to email" });
  } catch (err) {
    console.error("!!! Forgot Password Error Caught !!!:", err);
    res.status(500).json({ msg: "Server error during password reset request" });
  }
};

exports.resetPassword = async (req, res) => {
  console.log("\n--- Reset Password endpoint hit! ---");
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.resetToken !== code || Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("!!! Reset Password Error Caught !!!:", err);
    res.status(500).json({ msg: "Server error during password reset" });
  }
};

exports.getMyProfile = async (req, res) => {
  console.log("\n--- Get Profile endpoint hit! ---");
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  console.log("\n--- Update Profile endpoint hit! ---");
  const { name, currentSemester } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(4404).json({ msg: 'User not found' });
    }

    if (name) user.name = name;
    // Only students should be able to update their semester
    if (currentSemester && user.role === 'student') {
        user.currentSemester = currentSemester;
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json({ success: true, msg: 'Profile updated', data: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};