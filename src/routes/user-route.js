const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");
const { authentication } = require("../middleware/authMiddleware");


router.post("/admin", userController.registerAdmin);
router.post("/user", authentication,userController.createUser);
router.post('/login', userController.login)
router.get('/user',authentication,userController.getUser)
// router.get("/company",userController.getCompany)
module.exports = router;
