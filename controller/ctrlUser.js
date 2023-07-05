const service = require("../service");
const jwt = require("jsonwebtoken");
const User = require("../service/schemas/user");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const path = require("path");
const storeAvatar = path.join(process.cwd(), "tmp");
const fs = require("fs/promises");
const Jimp = require("jimp");

require("dotenv").config();

const SECRET = process.env.SECRET;

const registration = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await service.getUserByEmail(email);
    const avatarURL = gravatar.url(
        email,
        { s: "250", r: "pg", d: "retro" },
        true
    );
    if (user) {
        return res.status(409).json({
            status: "error",
            code: 400,
            message: "Email is already in use",
            data: "Conflict",
        });
    }
    try {
        const newUser = await new User({
            email,
            avatarURL,
            verify: false,
            verificationToken: uuidv4(),
        });
        newUser.setPassword(password);
        await newUser.save();

        const transporter = nodemailer.createTransport({
            service: "outlook",
            secure: false,
            auth: {
                user: "goitnode2023@outlook.com",
                pass: "Testowekontogoit1",
            },
        });

        const html = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 300px; background-color: #777777; font-family: sans-serif; font-size: 1.5rem; border: 1px solid #777777; border-radius: 10px;">
          <h1>Verification</h1>
          <p>Click on the link below to verify your account</p>
          <a href='http://localhost:3000/api/users/verify/${newUser.verificationToken}' target='_blank'>VERIFY</a>
          </div>`;

        const emailOptions = {
            from: "goitnode2023@outlook.com",
            to: email,
            subject: "Verification ✔",
            text: "Mail with verification link",
            html,
        };

        await transporter.sendMail(emailOptions);

        res.json({
            status: "success",
            code: 201,
            data: {
                email,
                message: "Register complete!",
            },
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await service.getUserByEmail(email);
    if (!user || !user.validPassword(password)) {
        return res.json({
            status: "error",
            code: 400,
            data: "Bad request",
            message: "Incorrect login/password",
        });
    }
    if (!user.verify) {
        return res.json({
            status: "error",
            code: 400,
            data: "Bad request",
            message: "Email is not verified",
        });
    }

    const payload = {
        id: user.id,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
    const updateToken = await service.updateUserToken(user.id, { token });
    return res.json({
        status: "success",
        code: 200,
        data: {
            token,
            updateToken,
        },
    });
};

const logout = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await service.getUserById(id);
        await service.updateUserToken(user.id, { token: null });
        res.json({
            status: "success",
            code: 204,
            data: "No Content",
            message: `User logged out`,
        });
    } catch (err) {
        next(err);
    }
};

const current = async (req, res, next) => {
    try {
        const { id, email, subscription } = req.user;
        await service.getUserById(id);
        const userData = {
            email,
            subscription,
        };
        res.json({
            status: "success",
            code: 200,
            data: { userData },
            message: "OK",
        });
    } catch (err) {
        next(err);
    }
};

const setAvatar = async (req, res, next) => {
    try {
        const { email } = req.user;
        const { path: tempName, originalname } = req.file;
        const fileName = path.join(storeAvatar, originalname);
        await fs.rename(tempName, fileName);

        const img = await Jimp.read(fileName);
        await img.autocrop().cover(250, 250).quality(60).writeAsync(fileName);

        await fs.rename(
            fileName,
            path.join(process.cwd(), "public/avatars", originalname)
        );

        const avatarURL = path.join(
            process.cwd(),
            "public/avatars",
            originalname
        );
        const cleanAvatarURL = avatarURL.replace(/\\/g, "/");

        const user = await service.updateAvatar(email, cleanAvatarURL);
        res.status(200).json({
            data: user,
            message: "File loaded successfully",
        });
    } catch (error) {
        next(error);
        return res.status(500).json({ message: "Server error" });
    }
};

const verificationToken = async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await service.verifyUser(verificationToken);

        if (user) {
            return res.status(200).json({ message: "Verification successful" });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        next(error);
        return res.status(500).json({ message: "Server error" });
    }
};
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ message: "Missing required field email" });
        }

        const user = await service.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verify) {
            return res
                .status(400)
                .json({ message: "Verification has already been passed" });
        }
        const transporter = nodemailer.createTransport({
            service: "outlook",
            secure: false,
            auth: {
                user: "goitnode2023@outlook.com",
                pass: "Testowekontogoit1",
            },
        });

        const html = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 300px; background-color: #777777; font-family: sans-serif; font-size: 1.5rem; border: 1px solid #777777; border-radius: 10px;">
          <h1>Verification</h1>
          <p>Click on the link below to verify your account</p>
          <a href='http://localhost:3000/api/users/verify/${user.verificationToken}' target='_blank'>VERIFY</a>
          </div>`;

        const emailOptions = {
            from: "goitnode2023@outlook.com",
            to: email,
            subject: "Verification ✔",
            text: "Mail with verification link",
            html,
        };

        await transporter.sendMail(emailOptions);
        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        next(error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    registration,
    login,
    logout,
    current,
    setAvatar,
    verificationToken,
    resendVerification,
};
