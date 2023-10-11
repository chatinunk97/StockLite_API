const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const morgan = require("morgan");
const cors = require('cors')

//Routes
const wmsRoute = require("./routes/wms-route");
const posRoute = require("./routes/pos-route");
const userRoute = require("./routes/user-route");
//Middlewares
const notFoundMiddleware = require("./middleware/defaultMiddleware/notFound");
const errorMiddleWare = require("./middleware/defaultMiddleware/error");
const requestLimitMiddleware = require('./middleware/defaultMiddleware/requestLimit')

//Initial Middleware
app.use(cors())
app.use(requestLimitMiddleware)
app.use(morgan("dev"));
app.use(express.json());

app.use("/manage", userRoute);
app.use("/wms", wmsRoute);
app.use("/pos", posRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleWare);

app.listen(PORT, () => {
  console.log(" ############ Server is running on PORT ", +PORT);
});
