const Joi = require("joi");
const prisma = require("../models/prisma");
const { USER_SUPERVISOR, USER_EMPLOYEE } = require("../config/constrants");

exports.registerAdminSchema = Joi.object({
  //Check Company profile data
  companyName: Joi.string().max(50).required(),
  companyLogo: Joi.string(),
  //Check Admin cridential
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  repeat_password: Joi.string()
    .valid(Joi.ref("password"))
    .trim()
    .required()
    .strip(),
  email: Joi.string().email().required(),
});

exports.registerUserSchema = Joi.object({
  firstName: Joi.string().max(50).trim().required(),
  lastName: Joi.string().max(50).trim().required(),
  username: Joi.string().alphanum().min(3).max(30).trim().required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .trim()
    .required(),
  repeat_password: Joi.string()
    .valid(Joi.ref("password"))
    .trim()
    .required()
    .strip(),
  email: Joi.string().email().required(),
  userRole: Joi.string().valid(USER_EMPLOYEE, USER_SUPERVISOR),
  companyId: Joi.number().required(),
});

exports.LoginSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  password: Joi.string().required(),
});

exports.checkExistingUser = async (value) => {
  const username = value.username || value.usernameOrEmail;
  const email = value.email || value.usernameOrEmail;
  const existUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
  return existUser;
};

exports.checkExistingCompany = async (value) => {
  const existUser = await prisma.companyProfile.findFirst({
    where: {
      OR: [{ companyName: value.companyName }, { companyId: value.companyId }],
    },
  });
  return existUser;
};
