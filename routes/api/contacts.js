const express = require("express");

const router = express.Router();

const contactsFunctions = require("../../models/contacts");

const checkContactId = (contact, contactId, res) => {
    if (!contact) {
        return res
            .status(404)
            .json({ message: `Contact with id=${contactId} was not found.` });
    }
};

router.get("/", async (req, res, next) => {
    const contacts = await contactsFunctions.listContacts();
    res.json(contacts);
});

router.get("/:contactId", async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await contactsFunctions.getContactById(contactId);
    checkContactId(contact, contactId, res);
    res.json(contact);
});

router.post("/", async (req, res, next) => {
    const newContact = await contactsFunctions.addContact(req.body);
    res.status(201).json(newContact);
});

router.delete("/:contactId", async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await contactsFunctions.removeContact(contactId);
    checkContactId(contact, contactId, res);
    return res.status(200).json({
        message: `Contact with id=${contactId} was deleted.`,
    });
});

router.put("/:contactId", async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await contactsFunctions.updateContact(contactId, req.body);
    checkContactId(contact, contactId, res);
    return res.status(200).json(contact);
});

module.exports = router;
