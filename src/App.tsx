import React, { useEffect, useState, useContext, createContext } from "react";
import 'bootstrap';
import NavBar, { TopNavBar, CardCreator, Footer, SortButton } from "./components";
import { Route, Routes, useNavigate } from "react-router-dom";
import Reader from "./Reader.tsx";
import Login from "./login.tsx";
import AccPage, { AccInfo, BookMarkTab, Uploader } from "./AccPage.tsx";
///////////////////////


export const serverAddress = import.meta.env.VITE_SERVER_ADDRESS;
type Book = {

    id: string;
    path: string;
    title: string;

    thumbnail: string;
    author?: string;
    language?: string;


}

export const LoginContext = createContext<any>(null);
export const authContext = createContext<any>(null);

function APP() {


    const navsize = (nav: any) => {


        let size;
        if (nav) {
            size = nav.offsetHeight;
        } else { return; }
        document.body.style.paddingTop = `${size}px`;
        document.documentElement.style.setProperty('--navH', `${size}px`);
      
        //   console.log("navsize is: "+ size);

    };
    useEffect(() => {
        const nav = document.getElementById("mainNavbar");
        navsize(nav);
        const observer = new ResizeObserver(() => { navsize(nav) });
        observer.observe(nav as HTMLElement);

        return () => { observer.disconnect() };

    }, []);



    //usestates
    const [openLogin, setlogin] = useState(false);
    const [books, setBooks] = useState<Book[]>([]);
    const [authStatus, setauthStatus] = useState({});

    let responseback;
    let cards;


    useEffect(() => {
        responseback = fetch("http://localhost:3001/api/books").then(res => res.json().then((data) => {
            console.log("the response from server: ", data);
            setBooks(data);



        }));

    }, []);



    cards = books.map((book) => (<CardCreator key={book.id} id={book.id} path={book.path} title={book.title}
        language={book.language} thumbnail={"http://localhost:3001/" + book.thumbnail} author={book.author} >

    </CardCreator>));

    let authRoutes;
    if ((authStatus as any)["existFlag"] == true) {

        authRoutes = (<>

            <Route path="/auth" element={<AccPage></AccPage>}>
                <Route path="profile" element={<AccInfo></AccInfo>}></Route>
                <Route path="upload" element={<Uploader></Uploader>}></Route>
                <Route path="bookmarks" element={<BookMarkTab></BookMarkTab>}></Route>

            </Route>

        </>)
        //  alert("if was hit");

    } else {

        // the error component
        //alert("else was hit "+ (authStatus as any)["existFlag"]);
    }


    return (
        <>
            <div className="d-flex flex-column" style={{minHeight: "calc(100vh - var(--navH))"}}>
            <authContext.Provider value={{ authStatus, setauthStatus }}>

            <TopNavBar onClicklogin={() => { setlogin(true); }}  books={books} setBooks={setBooks} >     </TopNavBar>
            <LoginContext.Provider value={openLogin} >

                <Login closeLogin={() => { setlogin(false); }} key={openLogin ? 'open' : 'closed'}></Login>

            </LoginContext.Provider>


            
            <Routes>
                <Route path="/read/books/:pat" element={<Reader />}></Route>
                <Route path="/" element={

                    <div className="row px-4 g-4 justify-content-center">
                                                

                        <SortButton setBook={setBooks}></SortButton>
                        {cards}

                    </div>}>
                            </Route>
                            

                {authRoutes}

                        </Routes>
                        
        </authContext.Provider>

                <Footer></Footer>
                </div>
        </>

    );

}

export default APP;


