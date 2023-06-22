const service = require("../service");
const jwt = require("jsonwebtoken");
const User = require("../service/schemas/user");

require("dotenv").config();
const SECRET = process.env.SECRET;

const registration = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await service.getUserByEmail(email);

    if (user) {
        return res.status(409).json({
            status: "error",
            code: 400,
            message: "Email is already in use",
            data: "Conflict",
        });
    }
    try {
        const newUser = new User({ email });
        newUser.setPassword(password);
        await newUser.save();
        res.json({
            status: "success",
            code: 201,
            data: {
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

module.exports = {
    registration,
    login,
    logout,
    current,
};
