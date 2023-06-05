const { nanoid } = require("nanoid");
const fs = require("fs/promises");
const path = require("path");
const contactsPath = path.resolve("models/contacts.json");

const listContacts = async () => {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data);
    return contacts;
};

const getContactById = async (contactId) => {
    const contacts = await listContacts();
    const contact = contacts.find((item) => item.id === contactId);
    return contact;
};

const removeContact = async (contactId) => {
    const contacts = await listContacts();
    const index = contacts.findIndex((item) => item.id === contactId);
    if (index === -1) {
        return null;
    }
    const [contact] = contacts.splice(index, 1);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return contact;
};

const addContact = async (body) => {
    const contacts = await listContacts();
    const contactId = nanoid();
    const newContact = { id: contactId, ...body };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return newContact;
};

const updateContact = async (contactId, body) => {
    const contacts = await listContacts();
    const index = contacts.findIndex((item) => item.id === contactId);
    if (index === -1) {
        return null;
    }
    contacts[index] = { ...contacts[index], ...body };
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return contacts[index];
};

module.exports = {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact,
};
