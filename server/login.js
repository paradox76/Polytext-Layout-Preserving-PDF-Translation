import express from 'express';
import pool from './db.js';
import bcrypt from 'bcrypt';
import signupRouter from './signup.js';





const rout = express.Router();

   
   
rout.use('/signup', signupRouter);

rout.post('/login', async (request, response, next) => {

   // console.log("login body:  ",request.body);     
   try {

      // console.log(result.rows,"\n this issssss printing the request:", request.body);


      const email = request.body.userEmail;
      const pwd = request.body.userPassword;

      const sqlCreds = await validCreds(email, pwd);


      if (sqlCreds.existFlag) {

         response.status(200).json({ ...sqlCreds, message: "Login Succesful" });

      } else {

         response.status(401).json({ ...sqlCreds, message: "Invalid email or password" });

      }


      //response.send(existFlag);


   } catch (error) {
      console.error(error, "\n", error.message);
      response.status(500).send("Error in sorvir");
   }


});




async function validCreds(email, pwd) {
   let existFlag = false;
   const result = await pool.query("select * from users where email =$1; ", [email]);
   console.log(" this below is the sql object returned \n", result.rows);

   if (result.rowCount != 0) {
      const actualpwd = result.rows[0].password;

      existFlag = await bcrypt.compare(pwd, actualpwd);
   }



   if (existFlag) {

      return {
         existFlag,
         id: result.rows[0].id,
         email: result.rows[0].email,
         username: result.rows[0].username

      }

   }

   return { existFlag };
}





export default rout;
