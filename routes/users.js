const express=require('express');
const router=express.Router();
const User=require('../models/User');
const bcrypt=require('bcryptjs')
const passport=require('passport');
router.get('/',(req,res)=>{
    res.render("welcome");

})
router.get('/login',(req,res)=>{
    res.render("login");

})
router.get('/register',(req,res)=>{
    res.render("register");

})
router.post('/register',(req,res)=>{
    const{ name,email,password,password2}=req.body;
    let errors=[];
    if(!name||!email||!password||!password2){
        errors.push({msg:'please enter the required field'});
    }
    if(password!==password2){
        errors.push({msg:'passwords dont match'});
    }
    if(password.length<6){
        errors.push({msg:'password should be at least 6 chracters long'});
    }
    if(errors.length>0){
        res.render('register',{
            errors,name,email,password,password2
        });
    }
    else{
       User.findOne({email:email})
       .then(user=>{
           if(user){
               errors.push({msg:'user already exists'});
               res.render('register',{
                   errors,name,email,password,password2
            });
           }
           else{
               const newuser=new User({
                   name,
                   email,
                   password
               })
               bcrypt.genSalt(10,(err,salt)=>
               bcrypt.hash(newuser.password,salt,(err,hash)=>{
                 if(err)throw err;
                 newuser.password=hash;

                 newuser.save()
                  .then(user=>{
                      req.flash('success_msg','You are now registered and can log in')
                      res.redirect('/users/login');
                  })
                  .catch(err=>console.log(err))
               }))
           }
       }) 
    }
})
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/home',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
})
module.exports=router;
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','you have logged out');
  res.redirect('/users/login');  
})