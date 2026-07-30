
import { useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authContext } from "./App";
import { serverAddress } from "./App";

function NavBar({ onClickLoginNav }: any) {
    const { authStatus, setauthStatus } = useContext(authContext);
    const navigator = useNavigate();

    return (
        <>
            <nav className="navbar navbar-dark" style={{padding: 0}}>
                <div className="container-fluid">
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navContent" style={{borderColor: "oklch(1 0 0 / 0.2)"}}>
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navContent" style={{background: "oklch(0.15 0.02 255)", padding: "8px 0"}}>
                        <div className="navbar-nav">

                            {(authStatus.existFlag == true) ? <>
                                <button className="nav-link text-start active" style={{color: "oklch(0.95 0.005 255)"}} onClick={() => navigator('/')}> Home</button>
                                <button className="nav-link text-start" style={{color: "oklch(0.95 0.005 255)"}} onClick={() => navigator('/auth/profile')} >Profile </button>
                                <button className="nav-link text-start" style={{color: "oklch(0.95 0.005 255)"}} onClick={() => navigator('/auth/upload')}> Upload Book</button>
                                <button className="nav-link text-start" style={{color: "oklch(0.95 0.005 255)"}} onClick={() => { setauthStatus({}); navigator('/'); }}> Logout</button>
                            </>

                                : (<>
                                    <button className="nav-link text-start active" style={{color: "oklch(0.95 0.005 255)"}} onClick={() => navigator('/')}> Home</button>
                                    <button className="nav-link text-start" style={{color: "oklch(0.95 0.005 255)"}} onClick={onClickLoginNav}>Login/SignUp</button>
                                </>)
                            }

                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

function TopNavBar({ onClicklogin, books, setBooks }: any) {
    const originalBooks = useRef<any[]>([]);

    return (
        <>
            <nav id="mainNavbar" className="navbar fixed-top navbar-dark" style={{background: "oklch(0.15 0.02 255)", borderBottom: "1px solid oklch(1 0 0 / 0.06)"}}>
                <div className="container-fluid">

                    <NavBar onClickLoginNav={onClicklogin}></NavBar>

                    <a className="navbar-brand d-flex align-items-center gap-2" style={{fontFamily: "Newsreader, serif", fontWeight: 600}}>
                        <div style={{width:"34px", height:"34px", borderRadius:"8px", background:"linear-gradient(135deg, oklch(0.72 0.13 195), oklch(0.6 0.15 195))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                            <div style={{width:"14px", height:"16px", border:"2px solid oklch(0.15 0.02 255)", borderTop:"none", borderRadius:"0 0 2px 2px"}}></div>
                        </div>
                        Polytext
                    </a>

                    <form className="d-flex" role="search">
                        <input className="form-control me-2" style={{backgroundColor:"#2b2b2b", color:"#f0f0f0", border:"1px solid #444", borderRadius:"10px"}} type="search" id="searchInput" placeholder="Search titles, authors…"
                            onInput={(e: any) => {
                                if (e.target.value === "") {
                                    setBooks(originalBooks.current.length > books.length ? originalBooks.current : books);
                                }
                            }}>
                        </input>
                        <button type="button" className="btn btn-primary" style={{borderRadius:"9px"}} onClick={() => {
                            const query = (document.getElementById("searchInput") as HTMLInputElement).value.toLowerCase().trim();
                            if (query === "") {
                                setBooks(originalBooks.current.length > books.length ? originalBooks.current : books);
                                return;
                            }
                            originalBooks.current = books;
                            setBooks(books.filter((book: any) => book.title.toLowerCase().includes(query)));
                        }}>Search</button>
                    </form>

                </div>
            </nav>
        </>
    )
}



const CardCreator = ({ id, title, path, language, author, thumbnail }: any) => {
    // const bid = id;
    // const btitle = title;
    // const bpath = path;
    // const blanguage = language;
    // const bauthor = author;
    // const bthumbnail = thumbnail;



    const returnElement = (

        <>
            <div className="card border-0 col-sm-6 col-md-4 col-lg-2 me-3 mb-4"
                style={{ background: "oklch(0.21 0.015 255)", borderRadius: "14px", overflow: "hidden" }}>
               <div className="poster">
                    <img src={thumbnail} className="card-img" style={{
                        width: "100%", height: "100%",
                    }}></img>
                    <div className="card-body d-flex flex-column align-items-center text-center" >
                        <p className="card-title " style={{fontFamily: "Newsreader, serif", color: "oklch(0.96 0.005 255)", fontSize: "16px"}}>{title}</p>
                        {author && <p style={{fontSize: "13px", color: "oklch(0.6 0.02 255)", margin: "0"}}>{author}</p>}
                        <Link to={`/read/a/${path}`}>
                            <button className="btn btn-primary ">Read</button>
                        </Link>
                    </div>
                </div>
            </div>

        </>

    );

    return returnElement;
};


const Footer = () => {

    const footReturn = (
        <>
            <footer data-bs-theme="dark" className="bg-body-tertiary border-top py-3 mt-auto" >
                <div className="container d-flex justify-content-between">
                    <span className="small" style={{color: "oklch(0.55 0.02 255)"}}>© 2026 Polytext</span>
                    <span>
                        <a href="#" className="text-decoration-none me-3" style={{color: "oklch(0.65 0.02 255)"}}>Contact</a>
                        <a href="#" className="text-decoration-none" style={{color: "oklch(0.65 0.02 255)"}}>GitHub</a>
                    </span>
                </div>
            </footer>
        </>
    );

    return footReturn;
};

function SortButton({ setBook }) {

    let filterOption = "";
    let sortOption = "";

    const filtersorter = async () => {

        filterOption = (document.getElementById("langFilter") as HTMLSelectElement).value;
        sortOption = (document.getElementById("sort") as HTMLSelectElement).value;

        const params = new URLSearchParams({ param1: "language", param2: filterOption, sort: sortOption });
        console.log(params.toString());

        //param1=language&param2=en&sort=
        const fetchRes = await fetch(serverAddress + "filter?" + params.toString());
        const filteredBooks = await fetchRes.json();
        setBook(filteredBooks);

    }

    return <>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 0", color: "oklch(0.65 0.02 255)", fontSize: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label htmlFor="langFilter" style={{ color: "oklch(0.65 0.02 255)" }}>Filter lang: </label>
                <select name="langFilter" id="langFilter" className="form-select form-select-sm" style={{ background: "oklch(0.22 0.015 255)", color: "oklch(0.9 0.005 255)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: "8px", width: "auto" }}>
                    <option value={"en"}>English</option>
                    <option value={"pa"}>Punjabi</option>
                    <option value={"hi"}>Hindi</option>
                </select>
                <label htmlFor="sort" style={{ color: "oklch(0.65 0.02 255)" }}>Sort: </label>
                <select name="sort" id="sort" className="form-select form-select-sm" style={{ background: "oklch(0.22 0.015 255)", color: "oklch(0.9 0.005 255)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: "8px", width: "auto" }}>
                    <option value={"title"}>Title</option>
                    <option value={"author"}>Author</option>
                </select>
            </div>
            <button className="btn btn-primary btn-sm" style={{ borderRadius: "8px" }} onClick={filtersorter}>Go!</button>
            <button className="btn btn-sm" style={{ color: "oklch(0.65 0.02 255)", background: "transparent", border: "none" }} onClick={async () => {
                const res = await fetch(serverAddress + "api/books");
                const books = await res.json();
                setBook(books);
            }}>✕</button>
        </div>
    </>;
}

export default NavBar;
export { TopNavBar, CardCreator, Footer, SortButton };