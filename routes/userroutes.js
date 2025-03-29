import express from "express";
import {  deleteuser,  getallprofiles,  getMyProfile, login, logout, signup, updatebookinguser, updateuser } from "../methods/user.js";
import { isadmin, verifytoken } from "./auth.js";

const routes = express.Router();
routes.put('/signup', signup);
routes.post('/login',login,verifytoken)
routes.post('/logout',logout,verifytoken);
routes.get('/getmyprofile',verifytoken,getMyProfile)
routes.get('/getallprofiles',verifytoken,isadmin("admin"),getallprofiles)//use it for dashboard page
routes.delete('/deleteuser/:id',verifytoken,isadmin("admin"),deleteuser)
routes.post('/updateuser/:id',verifytoken,isadmin("admin"),updateuser)
routes.post('/updatebookinguser/:id',verifytoken,isadmin("admin"),updatebookinguser)


export default routes;