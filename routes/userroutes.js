import {  getAllUsers, login, register,  } from "../controllers/user.js";
import { upload } from "../utilities/userMulter.js";
import express from 'express';

const app = express.Router();

app.post('/register',upload.single('image'),register)
app.get('/getusers',getAllUsers)
app.post('/login',login)
export default app;   