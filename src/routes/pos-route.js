const express = require("express");
const router = express.Router();
const userController = require("../controller/pos-controller");
const {
  authentication,
} = require("../middleware/authMiddleware/authMiddleware");

router.post("/transaction", authentication,userController.createTransaction);
router.get("/transaction", authentication,userController.getTransaction);
router.get("/shelf" ,authentication,userController.filterShelf)
module.exports = router;
