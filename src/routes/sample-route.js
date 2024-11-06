const express = require("express");
const logger = require("../helpers/logger");
const router = express.Router();

router.get("/",(req,res)=>{
    // throw Error("bad req")
    logger.info('Api hit');
    res.send("Everything is ok")
});

module.exports = router;
