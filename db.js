const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);
// we can use [then, catch] approach too or callback function when dealing with assynchronous nature code
// .then(() => {
//   console.log("Connected to database");
// })
// .catch((error) => {
//   console.log("error connecting to database", error);
// });
// ...................................

mongoose.connection.on("connected", () => console.log("MongoDB Connected"));
mongoose.connection.on("error", (err) => console.log("MongoDB Error", err));
