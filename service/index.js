const Contact = require("./schemas/contact");
const User = require("./schemas/user");

const getUserByEmail = (email) => {
    return User.findOne({ email });
};
const getUserById = async (id) => {
    return await User.findOne({ id });
};
const updateUserToken = (id, fields) => {
    return User.updateOne({ _id: id }, { $set: fields }, { new: true });
};

const getAllContacts = async () => {
    return await Contact.find();
};

const getContactById = (id) => {
    return Contact.findOne({ _id: id });
};

const createContact = ({ name, email, phone }) => {
    return Contact.create({ name, email, phone });
};

const updateContact = (id, fields) => {
    return Contact.findByIdAndUpdate(
        { _id: id },
        { $set: fields },
        { new: true }
    );
};

const removeContact = (id) => {
    return Contact.findByIdAndRemove({ _id: id });
};

module.exports = {
    getUserByEmail,
    getUserById,
    updateUserToken,
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    removeContact,
};
