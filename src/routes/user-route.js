const express = require("express");
const router = express.Router();
const userCreationMiddleware = require("../controller/user-controller");


router.post("/admin", userCreationMiddleware.registerAdmin);
router.post("/user", userCreationMiddleware.registerUser);
router.post('/login', userCreationMiddleware.login)

// router.get("/company",userCreationMiddleware.getCompany)
module.exports = router;
