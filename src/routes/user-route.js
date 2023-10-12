const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");
const { authentication } = require("../middleware/authMiddleware/authMiddleware");
const { adminAuthentication } = require("../middleware/authMiddleware/authAdminMiddleware");


router.post("/admin", userController.registerAdmin);
router.post('/login', userController.login)
router.post("/user", authentication,adminAuthentication,userController.createUser);
router.get('/user',authentication,adminAuthentication,userController.getUser)
// router.get("/company",userController.getCompany)
module.exports = router;
