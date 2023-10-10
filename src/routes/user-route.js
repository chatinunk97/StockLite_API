const express = require("express");
const router = express.Router();
const userCreationMiddleware = require("../controller/user-controller");
const { authentication } = require("../middleware/authMiddleware");


router.post("/admin", userCreationMiddleware.registerAdmin);
router.post("/user", authentication,userCreationMiddleware.createUser);
router.post('/login', userCreationMiddleware.login)

// router.get("/company",userCreationMiddleware.getCompany)
module.exports = router;
