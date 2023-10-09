const prisma = require("../models/prisma");
const createError = require("../utils/craeteError");

exports.authentication = async(req,res,next)=>{
    console.log(req.body)
    res.json({message : "Login reached"})
}
