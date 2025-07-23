import express, { Router } from 'express';
import cors from 'cors';
import fs from 'fs';
import path  from 'path';
import { fileURLToPath } from 'url';

const exp = express();
const PORT = 3001;
const router = Router();


exp.use(cors());
//converting everyhting to json i guess before r
exp.use(express.json());



function jsonToSend(){

    const jsIndexPath = import.meta.filename;
    console.log(new Date().toISOString() + " jsIndexPath: '"+jsIndexPath+"'");
    
    const curdirName = path.dirname(jsIndexPath);
    const allBookjsonPath = path



    } 

jsonToSend();


exp.get("/api/books",(reqest, reso)=>{
    console.log(new Date().toISOString() + "Request for ALL BOOK JSON is made") ;                  
    
    
                                        })



const server = exp.listen(PORT, ()=>{
    console.log(new Date().toISOString() +" - Server has started listening at PORT: "+PORT)});


