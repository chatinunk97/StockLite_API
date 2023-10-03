const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../controller/userMiddleware");


router.post("/company", authenticateMiddleware.registerCompany);
router.get("/company",authenticateMiddleware.getCompany)
module.exports = router;
