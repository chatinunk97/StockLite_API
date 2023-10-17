const express = require("express");
const router = express.Router();
const wmsController = require("../controller/wms-controller");
const {
  authentication,
} = require("../middleware/authMiddleware/authMiddleware");
const {
  supervisorAuthentication,
} = require("../middleware/authMiddleware/authSupervisorMiddleware");

//Supplier
router.post(
  "/supplier",
  authentication,
  supervisorAuthentication,
  wmsController.createSupplier
);
router.get("/supplier",authentication,supervisorAuthentication,wmsController.filterSupplier)
router.patch("/supplier",authentication,supervisorAuthentication,wmsController.editSupplier)
router.delete("/supplier",authentication,supervisorAuthentication,wmsController.deleteSupplier)

//Order
router.post("/order",authentication,supervisorAuthentication,wmsController.createOrder)
router.get('/order',authentication,supervisorAuthentication,wmsController.filterOrder)



module.exports = router;
