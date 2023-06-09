const express = require("express");
const router = express.Router();
const contactsFunctions = require("../../models/contacts");
const {
    validateCreateContact,
    validateUpdateContact,
} = require("../../models/validator");

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
    try {
        const { error } = validateCreateContact(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const newContact = await contactsFunctions.addContact(req.body);
        res.status(201).json(newContact);
    } catch (error) {
        next(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:contactId", async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const contact = await contactsFunctions.removeContact(contactId);
        checkContactId(contact, contactId, res);
        return res.status(200).json({
            message: `Contact with id=${contactId} was deleted.`,
        });
    } catch (error) {
        next(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.put("/:contactId", async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const { error } = validateUpdateContact(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const contact = await contactsFunctions.updateContact(
            contactId,
            req.body
        );
        checkContactId(contact, contactId, res);
        return res.status(200).json(contact);
    } catch (error) {
        next(error);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
