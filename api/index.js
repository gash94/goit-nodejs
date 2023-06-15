const express = require("express");
const router = express.Router();
const ctrlContact = require("../controller");

router.get("/contacts", ctrlContact.auth, ctrlContact.get);

router.get("/contacts/:id", ctrlContact.getById);

router.post("/contacts/", ctrlContact.create);

router.put("/contacts/:id", ctrlContact.update);

router.patch("/contacts/:id/favorite", ctrlContact.updateStatus);

router.delete("/contacts/:id", ctrlContact.remove);

router.post("/users/signup", ctrlContact.registration);

router.post("/users/login", ctrlContact.login);

module.exports = router;
