const express = require("express");
const router = express.Router();
const ctrlContact = require("../controller/ctrlContact");
const ctrlUser = require("../controller/ctrlUser");
const ctrlAuth = require("../controller/auth");

router.get("/contacts", ctrlAuth.auth, ctrlContact.get);

router.get("/contacts/:id", ctrlContact.getById);

router.post("/contacts/", ctrlContact.create);

router.put("/contacts/:id", ctrlContact.update);

router.patch("/contacts/:id/favorite", ctrlContact.updateStatus);

router.delete("/contacts/:id", ctrlContact.remove);

router.post("/users/signup", ctrlUser.registration);

router.post("/users/login", ctrlUser.login);

router.get("/users/logout", ctrlAuth.auth, ctrlUser.logout);

router.get("/users/current", ctrlAuth.auth, ctrlUser.current);

module.exports = router;
