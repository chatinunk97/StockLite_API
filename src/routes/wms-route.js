const express = require("express");
const router = express.Router();
const wmsController = require("../controller/wms-controller");
const {
  authentication,
} = require("../middleware/authMiddleware/authMiddleware");
const {
  supervisorAuthentication,
} = require("../middleware/authMiddleware/authSupervisorMiddleware");

router.post(
  "/supplier",
  authentication,
  supervisorAuthentication,
  wmsController.createSupplier
);
router.get("/supplier",authentication,supervisorAuthentication,wmsController.filterSupplier)
router.put("/supplier",authentication,supervisorAuthentication,wmsController.editSupplier)
router.delete("/supplier",authentication,supervisorAuthentication,wmsController.deleteSupplier)
module.exports = router;
