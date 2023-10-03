const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const morgan = require("morgan");

//Routes
const wmsRoute = require("./routes/wms-route");
const posRoute = require("./routes/pos-route");
const authRoute = require("./routes/auth-route");
//Middlewares
const notFoundMiddleware = require("./middleware/defaultMiddleware/notFound");
const errorMiddleWare = require("./middleware/defaultMiddleware/error");
const requestLimitMiddleware = require('./middleware/defaultMiddleware/requestLimit')

//Initial Middleware
app.use(requestLimitMiddleware)
app.use(morgan("dev"));
app.use(express.json());


app.use("/manage", authRoute);
app.use("/wms", wmsRoute);
app.use("/pos", posRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleWare);

app.listen(PORT, () => {
  console.log("Server is running on PORT ", +PORT);
});
