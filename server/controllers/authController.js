import User from "../models/userModel.js";
import Otp from "../models/otpModel.js";
import CustomError from "../utils/customError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import { joiUserSchema } from "../models/joiSchema.js";
const sendMail = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      from: "xclone",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "xclone",
      to: email,
      subject: title,
      html: body,
    });
    return info;
  } catch (error) {
    console.log(error);
    throw new CustomError(500, "Error when sending Email");
  }
};

export const sendRegisterOtpMail = async (email, otp) => {
  await sendMail(
    email,
    "Verify your email for Xclone",
    `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #000000; padding: 20px; border-radius: 12px; color: #ffffff;">
      <h2 style="color: #1D9BF0;">Welcome to Xclone!</h2>
      <p style="color: #e1e1e1;">Your one-time password (OTP) for email verification:</p>
      <h1 style="color: #000000; background: #1D9BF0; display: inline-block; padding: 12px 24px; border-radius: 8px; letter-spacing: 2px;">
        ${otp}
      </h1>
      <p style="color: #b3b3b3; margin-top: 20px;">This OTP expires in 5 minutes.</p>
      <hr style="border: 0; height: 1px; background: #2f3336; margin: 20px 0;" />
      <p style="font-size: 14px; color: #6e767d;">If you didn’t request this, you can safely ignore this email.</p>
    </div>
    `
  );
};



const sendOtp = async (req,res,next)=> {
  const { email } = req.params;
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return next(new CustomError(400, "Email already exists"));
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

  await Otp.findOneAndDelete({ email });
  const otpDoc = await Otp.create({ email, otp, expiresAt });
  

  await sendRegisterOtpMail(email, otp);

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
  });
};

const verifyOtp = async (req,res,next) => {
  const { email, otp } = req.body;

  const otpDoc = await Otp.findOne({ email });

  if (!otpDoc) {
    return next(new CustomError(400, "OTP not found"));
  }
  if (otpDoc.verified) {
    return res.status(400).json({ error: "OTP is already verified" });
  }
  if (otpDoc.expiresAt < new Date()) {
     return res.status(400).json({ error: "OTP is expired" });
  }
  if (otpDoc.otp !== otp) {
    return  res.status(400).json({ error: "OTP is incorrect" });
  }

  await otpDoc.updateOne({ verified: true });

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
  });
};

const verifyRegister = async (req,res,next) => {
  const { value, error } = joiUserSchema.validate(req.body);
  if (error) {
    return next(new CustomError("Invalid input", 400));
  }
  const { name, email, userName, password } = value;

  const userNameExists = await User.findOne({ userName });
  if (userNameExists) {
    return next(new CustomError(400, "Username already exists"));
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return next(new CustomError(400, "Email already exists"));
  }

  const otpVerified = await Otp.findOne({ email, verified: true });
  if (!otpVerified) {
    return next(new CustomError(400, "Email not verified"));
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    name,
    userName,
    email,
    password: hashedPassword,
  });
  await Otp.findOneAndDelete({ email });
  return res
    .status(201)
    .json({ status: "success", message: "User created successfully" });
};

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("user is not found", 404));
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return next(new CustomError("incorrect password", 401));
  }
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: "3d" }
  );
  const userDetail = {
    name: user.name,
    username: user.userName,
    profile: user.pfp,
    header: user.header,
    bio: user.bio,
    web: user.web,
    location: user.location,
   
    _id: user._id,
  };

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res
    .status(200)
    .json({ message: "successfully logged in", userDetail, accessToken });
};


const userLogout = async (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "logged out successfully" });
};

const refreshingToken = async (req, res, next) => {
  if (!req.cookies) {
    return next(new CustomError("No cookies found", 401));
  }
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new CustomError("No refresh Token found", 401));
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

  if (!decoded) {
    return next(new CustomError("invalid refresh Token", 401));
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new CustomError("User Not Found", 404));
  }

  let accessToken = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, {
    expiresIn: "1d",
  });
  res.status(200).json({ message: "Token refreshed", accessToken });
};

export { sendOtp, verifyRegister, userLogin, userLogout, refreshingToken,verifyOtp };
