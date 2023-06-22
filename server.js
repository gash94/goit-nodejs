const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises;
const uploadDir = path.join(process.cwd(), "uploads");
const storeImage = path.join(process.cwd(), "images");
const multer = require("multer");

require("dotenv").config();

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

require("./config/config-passport");

const routerApi = require("./api");
app.use("/api", routerApi);

app.use((_, res, __) => {
    res.status(404).json({
        status: "error",
        code: 404,
        message: `Use api on routes: 
        /api/signup - registration user {email, password}
        /api/login - login {email, password}
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
    limits: {
        fileSize: 1048576,
    },
});

const upload = multer({
    storage: storage,
});

app.post("/upload", upload.single("picture"), async (req, res, next) => {
    const { description } = req.body;
    const { path: temporaryName, originalname } = req.file;
    const fileName = path.join(storeImage, originalname);
    try {
        await fs.rename(temporaryName, fileName);
    } catch (err) {
        await fs.unlink(temporaryName);
        return next(err);
    }
    res.json({
        description,
        message: "File uploaded successfully",
        status: 200,
    });
});

const isAccessible = (path) => {
    return fs
        .access(path)
        .then(() => true)
        .catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
    if (!(await isAccessible(folder))) {
        await fs.mkdir(folder);
    }
};

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;

const connection = mongoose.connect(uriDb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

connection
    .then(() => {
        app.listen(PORT, function () {
            createFolderIsNotExist(uploadDir);
            createFolderIsNotExist(storeImage);
            console.log(
                `Database connection successful. Use our API on port: ${PORT}`
            );
        });
    })
    .catch((err) => {
        console.log(`Server not running. Error message: ${err.message}`);
        process.exit(1);
    });
