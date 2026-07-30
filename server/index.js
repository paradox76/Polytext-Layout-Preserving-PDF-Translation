import dotenv from 'dotenv';

import express, { Router } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rout from './login.js';
import pool from './db.js';
import { transRoute } from './translation.js';
import { execFile } from 'child_process';
import e from 'express';
import { Pool } from 'pg';
import multer from 'multer';
import { json } from 'stream/consumers';
import { userInfo } from 'os';
import rateLimit from 'express-rate-limit';

dotenv.config({ path: '../.env' });
console.log(process.env.DB_USER);

const exp = express();
const PORT = 3001;
//const router = Router();


exp.use(cors());
//converting everyhting to json i guess before r
exp.use(express.json());
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    message: { message: "Too many attempts" },
    skipSuccessfulRequests:true
});
 
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {message: "Upload limit reached"}
});



const strg = multer.diskStorage({
    destination: "./books", filename: (req, file, call) => {
        const real = file.originalname;
        call(null, real);
    }
});
const multy = multer({
    storage: strg

});




const jsIndexPath = import.meta.filename;
let curdirName = path.dirname(jsIndexPath);


//extract json from json file to send
function jsonToSend(res) {



    // const allBookjsonPath = path.join(curdirName, "utils", "allBooks.json");

    // const isPresent = fs.existsSync(allBookjsonPath);

    // console.log(new Date().toISOString() + " jsonBookPath: '" + allBookjsonPath + "'");
    // console.log(isPresent);
    let pureJSON;
    
    const queryAllBooks = pool.query("select book_id as id, book_name as title, path, language, author, thumbnail from books;");
    queryAllBooks.then((result) => {
        
        pureJSON = result.rows;
        console.log(pureJSON);
        res.json(pureJSON);

    });

    return pureJSON;

   // const pureJSON = fs.readFileSync(allBookjsonPath, 'utf-8');

}



// const pureJSON = jsonToSend();
// server the json data about books available


exp.get("/api/books", (reqest, reso) => {
    const pureJSON = jsonToSend(reso);
    console.log(new Date().toISOString() + " Request for ALL BOOK JSON is made");
    // reso.json(pureJSON);



});


exp.post("/api/bookmarks", async (req, res) => { 

    const userinfo = req.body;
    const email = userinfo.email; //paradox@gmail.com
    const id = userinfo.id;

    if (id == 1) {
        
        const bookNames = await pool.query("select book_name as title from books;");
        if (bookNames.rowCount < 1) { return; }
        
        res.json(bookNames.rows);

        console.log("This user requesting bookmarks: ", userinfo, bookNames);
    } else { 
        res.status(200).send();
    }

   
    


});

exp.post("/api/book/delete", async (req, res) => { 
    if (req.body.authStatus.id != 1) { return; }
    const authStatus = req.body.authStatus;
    const deleteList = req.body.forDelete;
    console.log(authStatus, deleteList);

    const queryRes = await pool.query("Delete from books where book_name = ANY($1)",[deleteList]);
    


    const bookNames = await pool.query("select book_name as title from books;");
     
        
        res.json(bookNames.rows);
   

});

exp.get("/filter", async (req, res) => { 
    let flag = false;
    const key = req.query.param1;
    const value = req.query.param2;
    const sort = req.query.sort;

    let query1 = "";
    let query2 = "";
    let paramAry = [];

    switch (key) {
        case "language":
        case "author":
            flag = true;
            query1 = " where " + key + "=" + "$1";
            paramAry.push(value);
            break;
        case undefined:
            break;
            
    
        default:
          
            res.status(404).send("Fuck you");
            return;
            break;
    }
 
    if (sort) { 

        query2 = " order by "+sort;
     //   paramAry.push(sort);

    }

    
    let query = "select book_id as id, book_name as title, path, language, author, thumbnail from books" +query1+query2 ;
    console.log(query, paramAry);
    const result = await pool.query(query, paramAry);
    console.log(result.command);
    const filtRows = result.rows;

    console.log("filtered rows: ", filtRows);
    res.json(filtRows)

});

exp.get("/admin/processEverything", () => {
    const pyScript = "./utils/bookJsonMaker.py";
    const python = process.env.PYTHON_PATH;

    execFile(python, [pyScript], (err, stdout, stderr) => {
        console.log("This is from python:", stdout);
        console.log("stderr:", stderr);
        console.log("err:", err);

        const allBooks = JSON.parse(stdout);
        for (const book of allBooks) {

            const result = pool.query("Insert into books (book_name, path, language, author, thumbnail, upload_time) Values ($1, $2,$3, $4, $5, NOW() ) ON conflict (book_name) DO nothing",
                [book.title, book.path, book.language, book.author, book.thumbnail]);

            result.then(() => { console.log("books from loop: ", result); });

        }




    });


})
exp.post("/books/upload", uploadLimiter ,multy.single("theUpload"), (req, res) => {
    // const testPath = "ANIMAL FARM BY GEORGE ORWELL.pdf";
    const pyScript = "./utils/bookJsonMaker.py";
    const python = process.env.PYTHON_PATH;
    const upFilePath = req.file.filename; // file.pdf

    execFile(python, [pyScript, upFilePath], (err, stdout, stderr) => {
        console.log("This is from python:", stdout);
        console.log("stderr:", stderr);
        console.log("err:", err);


        const bookInfo = JSON.parse(stdout);
        console.log("the parsed stuff: ", bookInfo);

        const queryRes = pool.query("Insert into books (book_name, path, language, author, thumbnail, upload_time) Values ($1, $2,$3, $4, $5, NOW() ) ON conflict (book_name) DO nothing",
            [bookInfo[0].title, bookInfo[0].path, bookInfo[0].language, bookInfo[0].author, bookInfo[0].thumbnail]);
        queryRes.then(() => { console.log(queryRes); });

        res.status(200).send("File uploaded sucessfully");
    }

    );

})
//server the thumbnails for books
exp.use("/books/thumbnail", (req, res, next) => { console.log("A thumbnail request is made at url:  ", req.url); next() }, express.static(path.join(curdirName, '/books/thumbnail/')))



//book pdfs sending

exp.use("/books", (req, res, next) => {
    console.log("Requests to send pdf at url: ", req.url); next();
},
    express.static(path.join(curdirName, "/books/")));



// login callg
exp.use("/api/user/login", loginLimiter ,rout);


exp.post("/api/user/username", async (request, response, next) => {

    const username = request.body.username;
    const userId = request.body.authStatus.id;
    if (!userId) {
        response.status(401).json({ message: "Unauthorized" });
        return;
    }
    const addUsername = await pool.query("UPDATE users SET username = $1 WHERE id = $2", [username, userId]);
    response.status(200).json({ message: "Username updated" });
});

exp.use("/api/translate/", transRoute);






const server = exp.listen(PORT, () => {
    console.log(new Date().toISOString() + " - Server has started listening at PORT: " + PORT)
});


