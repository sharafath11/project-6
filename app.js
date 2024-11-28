import express from "express";
import adminRouter from './Routs/adminRouter.js'
import "dotenv/config";
import bodyParser from "body-parser";
import userRoute from "./Routs/userRoutes.js";
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
const app = express();
const PORT = process.env.PORT || 4000;
// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Configure EJS and EJS Layouts
app.set("view engine", "ejs");
app.set("views", "./Views");

// Set up express-session
app.use(session({
  secret:process.env.SESIION_KEY , // Replace with a strong secret key
  resave: false, // Avoids resaving session if unmodified
  saveUninitialized: true, // Saves uninitialized sessions
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 60000 // Cookie expiration time in milliseconds
  }
}));
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});
// Serve static files from the 'public' directory
app.use(express.static("public"));

// Use user routes
app.use("/", userRoute);
app.use('/admin', adminRouter);
// db connection
const url = process.env.MONGO_URL;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
