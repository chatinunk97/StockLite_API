const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");
const {
  authentication,
} = require("../middleware/authMiddleware/authMiddleware");
const {
  adminAuthentication,
} = require("../middleware/authMiddleware/authAdminMiddleware");

router.post("/admin", userController.registerAdmin);
router.post("/login", userController.login);
router.post(
  "/user",
  authentication,
  adminAuthentication,
  userController.createUser
);
router.get(
  "/userFilter",
  authentication,
  adminAuthentication,
  userController.filterUser
);
router.delete("/user",authentication,adminAuthentication,userController.deleteUser)
router.patch("/user",authentication,adminAuthentication,userController.editUser)
router.get("/sales" , authentication,adminAuthentication,userController.getSales)

// This one is for nutural use to get LoginUser state
router.get("/user", authentication, userController.getUser);
module.exports = router;
