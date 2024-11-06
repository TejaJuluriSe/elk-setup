const express = require("express");
const app = express();
const cors = require("cors");
const winston = require("winston");
const bodyParser = require("body-parser");
const apiRoutes = require("./src/routes/sample-route");
const logger = require("./src/helpers/logger");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use("/api",apiRoutes)
app.listen(3001,()=>{
    logger.info(`Server started on port 3001`);
})