var express = require("express");
var router = express.Router();
var nodemailer = require('nodemailer');
require("dotenv").config();
const mongoose = require("mongoose");
const  users= require("../schema");



const { hashing, hashCompare, createjwt, auth} = require("../library/auth");


mongoose
  .connect(process.env.dbUrl)
  .then(() => console.log("db connected successfully"));
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/register", async (req, res) => {
  try {
    
    const hash = await hashing(req.body.password);
    req.body.password = hash;
    const register = await users(req.body);
    const token = await createjwt({email:req.body.email})
      register.save((err, data) => {
      if (err) {
        console.log(err);
        res.json({statuscode:400,
        message:"email already exist"});
      } else {
        res.json({
          data: data,
        });
        console.log(token);
      }
    });
  } catch (error) {
    console.log(error);
    console.log("hashing error");
  }
});

router.post("/login", async (req, res) => {
  try {
     const login = await users.findOne({email:req.body.email});
      if (login) {
        const compare =await  hashCompare(req.body.password, login.password);
        console.log(compare)
        if (compare ) {
           await createjwt({email:req.body.email})
          
          res.json({
            statuscode: 200,
            messsage: "login successfully",
            });
        } else {
          res.json({
            message:"wrong password"
          })
          console.log("wrong password");
        }
        
      } else {
        console.log(error);
        res.json({message:"Email does not exist"})
      }
    
  } catch (error) {
    console.log(error);
  }
});

router.post("/forgot-password",async(req,res)=>{
  try {
    let step =await users.findOne({email:req.body.email})
    const {name}= await step
    if (step) {
      let token = await createjwt({email:req.body.email});
      
      var sender =await  nodemailer.createTransport({
        service:'gmail',
     auth :{
         user:"fullstackdeveloper772@gmail.com",
         pass:process.env.pass
     }
     });var composeMail = {
      from:'fullstackdeveloper772@gmail.com',
      to: req.body.email,
      subject:`Reset-password-verification`,
      text:"",
      html:`<h2>Hello ${name}</h2>
      <p>We've recieved a request to reset the password for your account associated with your email.
      You can reset your password by clicking the link below</p>
      <a href=http://localhost:4000/verify/${token}> Reset Password</a>
      <p><b>Note:</b>The link expires 2 minutes from now</p>
      </div>`
  }
  
  sender.sendMail(composeMail,(error,data)=>{
      if(error){
          console.log(error);
      }else{
          console.log(data)
      }
  
  });res.json({statuscode:200,
  message:"mail sended"})
  
    } else{
      console.log(error)
    }
  } catch (error) {
    console.log(error)
    res.json({statuscode:400,
    message:"email not exist"})
  }
 
});

router.post("/verify/:token",async(req,res)=>{
  try {
    const mail = await auth(req.params.token)
    if (mail) {
      let pass = await  hashing(req.body.password)
      await users.updateOne({email:mail},{$set:{password:pass}})
     
      res.json({
        statuscode:200,
        message:"password changed successfullly",
       
      })
    } else {
      res.json({
        message:"token expired"
      })
    }
   
     } catch (error) {
    console.log(error)
  }

})

module.exports = router;
