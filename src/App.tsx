import React, { useEffect } from "react";
import 'bootstrap';
import NavBar,{TopNavBar, CardCreator, Footer} from "./components";


///////////////////////
function APP(){
    const navsize = (nav) =>{

        
        let size;
        if(nav){
         size = nav.offsetHeight;
        }else{return;}
       document.body.style.paddingTop = `${size}px`;
        console.log("navsize is: "+ size);
        
    };
useEffect(()=>{
    const nav = document.getElementById("mainNavbar");
    navsize(nav)
    const observer = new ResizeObserver(()=>{navsize(nav)});
    observer.observe(nav);

    return ()=> {observer.disconnect()};

},[]);


return (
 <>
    <TopNavBar  ></TopNavBar>
    <div className="row ">
    {/*<CardCreator src= "assets\books\The picture of dorian gray.png"
     name = "Picture of dorian gray"></CardCreator>*/}
     

    </div>


   <Footer></Footer>
 </>

);

}

export default APP;


