var express = require("express");
var router = express.Router();
require("dotenv").config();
const mongoose = require("mongoose");
const  userRegister= require("../schema");
const  userLogin= require("../schema2");

const { hashing, hashCompare } = require("../library/auth");

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
    const register = await new userRegister(req.body);
    register.save((err, data) => {
      if (err) {
        console.log(err);
        console.log("saving error");
      } else {
        res.json({
          data: data,
        });
        console.log("pushed");
      }
    });
  } catch (error) {
    console.log(error);
    console.log("hashing error");
  }
});

router.post("/login", async (req, res) => {
  try {
    
    const login = userRegister.findOne({email:req.body.email});
      if (login) {
        const compare =await  hashCompare(req.body.password, login.password);
        if (compare) {
          res.json({
            statuscode: 200,
            messsage: "login successfully",
           
          });
        } else {
          console.log("wrong password");
        }
        
      } else {
        console.log(error);
      }
    
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
