import express from "express";
import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import session from "express-session";
const router = express.Router();
//mongo db conn
// Route to render the registration page
router.get("/register", (req, res) => {
  res.render("register");
});

// Route to render the index page
router.get("/", (req, res) => {
  console.log("sessionnnn ",req.session);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  console.log("kaka koy",req.session.user);
  
  if (req.session.user) {
    console.log(req.session.user);
   
    res.render("homePage"); 
  } else {
    // If no session exists, render the login page
    res.render("login");
  }
});
router.post("/register", async (req, res) => {
  try {
    const { username, place, email, password } = req.body;
    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userModel = new UserModel({
      username,
      place,
      email,
      password: hashedPassword,
    });
    await userModel.save();
  

  
   return res.status(202).send(`<script>
      alert('Register succesfully');
      window.location.href = '/';
    </script>`);
  } catch (error) {
    return res.status(400).send(`
      
    <script>
      alert('${error.message}');
      window.location.href = '/';
    </script>
 
`);
  }
  
});
router.get("/login",(req,res)=>{
 
  res.redirect("/")
})
router.post('/login', async (req, res) => {
  try {
      const { password, email } = req.body;
      const user = await UserModel.findOne({email });

      if (!user) {
          return res.status(404).send('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch ) {
          return res.status(400).send(`
      
            <script>
              alert('User or password invalid');
              window.location.href = '/';
            </script>
         
        `)
      }
     else{
       req.session.user = {
        id: user._id,
        username: user.username,
      };
      return res.status(200).render("homePage");
     }
      
  } catch (error) {
      console.error(error);
     return  res.status(500).redirect("/");
  }
});
router.get("/logout",(req,res)=>{
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
})


export default router;
