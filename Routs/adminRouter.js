
import express from "express";
import "dotenv/config";
import session from "express-session";
import UserModel from "../models/userModel.js";
import bcrypt from 'bcrypt';

const router = express.Router();
const adminName = process.env.ADMIN_NAME;
const adminPassword = process.env.ADMIN_PASSWORD;

// Middleware to set no-cache headers
const setNoCache = (req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

// Middleware to check if admin is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

// Admin login page
router.get("/", (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (req.session.admin) {
    res.redirect("/admin/page");
  } else {
    res.render("adminLogin");
  }
});

// Handle admin login
router.post("/login", setNoCache, async (req, res) => {
  const { name, password } = req.body;

  if (name === adminName && password === adminPassword) {
    req.session.admin = { name: adminName };
    res.redirect("/admin/page");
  } else {
    res.status(400).send(`
      <script>
        alert('Admin name or password invalid');
        window.location.href = '/admin';
      </script>
    `);
  }
});

// Admin page (protected route)
router.get("/page", isAuthenticated, setNoCache, async (req, res) => {
  const users = await UserModel.find({});
  res.status(200).render("adminPage", { users });
});

// Handle logout
router.post("/logout", isAuthenticated, setNoCache, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/admin");
  });
});

// Edit page 
router.get('/edit/:id', isAuthenticated, setNoCache, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found.');
    }
    res.render('editPage', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error.');
  }
});

// Handle edit form submission
router.post('/edit/:id', isAuthenticated, setNoCache, async (req, res) => {
  try {
    const { username, place, email } = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { username, place, email },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send('User not found.');
    }
    res.redirect("/admin/page");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error.');
  }
});

// Add user page
router.get("/create", isAuthenticated, setNoCache, (req, res) => {
  res.render("adminAddUser");
});

// Handle add user form submission
router.post("/create", isAuthenticated, setNoCache, async (req, res) => {
  try {
    const { username, place, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      username,
      place,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(202).send(`
      <script>
        alert('User registered successfully.');
        window.location.href = '/admin/page';
      </script>
    `);
  } catch (error) {
    res.status(400).send(`
      <script>
        alert('${error.message}');
        window.location.href = '/admin/create';
      </script>
    `);
  }
});
// Handle user deletion
router.post('/remove/:id', isAuthenticated, setNoCache, async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found.');
    }
    res.status(202).send(`
      <script>
        alert('Delete User : )');
         window.location.href = '/admin/page';
      </script>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error.');
  }
});


export default router;

