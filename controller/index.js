const service = require("../service");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../service/schemas/user");

require("dotenv").config();
const SECRET = process.env.SECRET;

const auth = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
        if (!user || err) {
            return res.status(401).json({
                status: "error",
                code: 401,
                message: "Unauthorized",
                data: "Unauthorized",
            });
        }
        req.user = user;
        next();
    })(req, res, next);
};

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

const get = async (req, res, next) => {
    try {
        const results = await service.getAllContacts();
        res.json({
            status: "success",
            code: 200,
            data: {
                contacts: results,
            },
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
};

const getById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await service.getContactById(id);
        if (result) {
            res.json({
                status: "success",
                code: 200,
                data: { contact: result },
            });
        } else {
            res.status(404).json({
                status: "error",
                code: 404,
                message: `Not found contact id: ${id}`,
                data: "Not Found",
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
};

const create = async (req, res, next) => {
    const { name, email, phone } = req.body;
    try {
        const result = await service.createContact({ name, email, phone });

        res.status(201).json({
            status: "success",
            code: 201,
            data: { contact: result },
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
};

const update = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
        const result = await service.updateContact(id, { name, email, phone });
        if (result) {
            res.json({
                status: "success",
                code: 200,
                data: { contact: result },
            });
        } else {
            res.status(404).json({
                status: "error",
                code: 404,
                message: `Not found contact id: ${id}`,
                data: "Not Found",
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
};

const updateStatus = async (req, res, next) => {
    const { id } = req.params;
    const { favorite = false } = req.body;

    try {
        const result = await service.updateContact(id, { favorite });
        if (result) {
            res.json({
                status: "success",
                code: 200,
                data: { contact: result },
            });
        } else {
            res.status(404).json({
                status: "error",
                code: 404,
                message: `Not found contact id: ${id}`,
                data: "Not Found",
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
};

const remove = async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await service.removeContact(id);
        if (result) {
            res.json({
                status: "success",
                code: 200,
                data: { contact: result },
            });
        } else {
            res.status(404).json({
                status: "error",
                code: 404,
                message: `Not found contact id: ${id}`,
                data: "Not Found",
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
};

module.exports = {
    registration,
    login,
    auth,
    get,
    getById,
    create,
    update,
    updateStatus,
    remove,
};
