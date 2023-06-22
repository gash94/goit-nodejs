require("dotenv").config();
require("./config/config-passport");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));

const routerApi = require("./api");
app.use("/api", routerApi);
app.use("/avatars", express.static(path.join(__dirname, "./public/avatars")));
app.use(express.static("public"));

app.use((_, res, __) => {
    res.status(404).json({
        status: "error",
        code: 404,
        message: `Use api on routes: 
        /api/users/signup - registration user {email, password}
        /api/users/login - login {email, password}
        /api/contacts - get message if user is authenticated`,
        data: "Not found",
    });
});

app.use((err, _, res, __) => {
    console.log(err.stack);
    res.status(500).json({
        status: "fail",
        code: 500,
        message: err.message,
        data: "Internal Server Error",
    });
});

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;

const connection = mongoose.connect(uriDb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const isExist = (path) => {
    return fs
        .access(path)
        .then(() => true)
        .catch(() => false);
};

const createDir = async (path) => {
    if (!(await isExist(path))) {
        await fs.mkdir(path);
    }
};

connection
    .then(() => {
        app.listen(PORT, function () {
            createDir("./tmp");
            createDir("./public");
            createDir("./public/avatars");
            console.log(
                `Database connection successful. Use our API on port: ${PORT}`
            );
        });
    })
    .catch((err) => {
        console.log(`Server not running. Error message: ${err.message}`);
        process.exit(1);
    });
