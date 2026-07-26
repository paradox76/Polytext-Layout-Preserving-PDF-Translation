import express from 'express';
import pool from './db.js';
import bcrypt from 'bcrypt';


const signupRouter = express.Router();

signupRouter.post('/', async (request, response, next) => {

    try {
        console.log("signup route hit");
        const email = request.body.userEmail;
        const pwd = request.body.userPassword;

        //check if it already exists
        console.log(email, pwd);
        const userExistFlag = await doUserExist(email);

        if (userExistFlag == false) {

            const encpwd = await bcrypt.hash(pwd, 10);

            const queryRes = await pool.query("Insert into users (email, password, created_at) VALUES ($1, $2, NOW())", [email, encpwd]);

            console.log(queryRes);
            if (queryRes.rowCount > 0) {
                response.status(200).json({ message: "Account created succesfully" });
            }
            else {
                response.status(409).json({ message: "How did you manage this conflict" });
            }
        } else {

            response.status(409).json({ message: "User already exists" });


        }

    } catch (error) {
        console.error(error, "\n", error.message);
        response.status(500).send({ message: "Error in sorvir" });

    }




});


async function doUserExist(email) {
    let existFlag = false;
    const result = await pool.query("select password from users where email =$1; ", [email]);

    if (result.rowCount != 0) {

        existFlag = true
    }

    return existFlag;
}


export default signupRouter;