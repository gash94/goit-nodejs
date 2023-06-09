const Joi = require("joi");
const JoiPhoneValidate = Joi.extend(require("joi-phone-number"));

const validator = (schema) => (payload) =>
    schema.validate(payload, { abortEarly: false });

const schemaCreateContact = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: JoiPhoneValidate.string()
        .phoneNumber({ defaultCountry: "PL", format: "international" })
        .required(),
});

const schemaUpdateContact = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    phone: JoiPhoneValidate.string().phoneNumber({
        defaultCountry: "PL",
        format: "international",
    }),
}).min(1);

exports.validateCreateContact = validator(schemaCreateContact);
exports.validateUpdateContact = validator(schemaUpdateContact);
