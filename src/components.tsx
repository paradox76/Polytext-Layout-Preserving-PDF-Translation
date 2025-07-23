function NavBar(){
return (<>
<nav className="navbar" >
<div className="container-fluid">
    <a className="navbar-brand" href="#"><img src = "/assets/logo.svg"/></a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
    data-bs-target="#navContent">
      <span className="navbar-toggler-icon"></span>      
    </button>
    
    <div className="collapse navbar-collapse" id="navContent">
     <div className ="navbar-nav">
        <a className="nav-link " href="#"> option 1</a>
        <a className="nav-link" href="#"> option 2</a>
        <a className="nav-link active" href="#"> option 3</a>
        <a className="nav-link" href="#"> option 4</a>

     </div>
    </div>
</div>
</nav>
</>
)

}

function TopNavBar(){
return(
<>
    
    <nav id ="mainNavbar" className="navbar fixed-top bg-body-tertiary">
        <div className="container-fluid">
            <NavBar></NavBar>
            <a className="navbar-brand"> Website brand</a>
            <form className="d-flex" role="search">
                <input className="form-control me-2" type="search" placeholder="type stuff here"></input>
                <button type="button" className="btn btn-outline-success">Search</button>

            </form>

        </div>
    </nav>


</>

)




}



const CardCreator = ({src, name})=> {

    const returnElement = (
        
        <>
            <div className="card border-0 shadow col-md-1 col-lg-2 text-bg-dark me-3 mb-4">
                <div className="poster">
                <img src={src} className= "card-img" style={{
                    width: "100%", height: "100%",
                }}></img>
                <div className="card-body d-flex flex-column align-items-center text-center" >
                    <p className="card-title ">{name}</p>
                    <button className="btn btn-primary ">Read</button>
                    
                </div>
                </div>
            </div>
              
        </>

    );

    return returnElement;
}


const Footer = () => {
    
    const footReturn = (
        <>
        <footer className="bg-body-tertiary border-top py-3">
        <div className="container d-flex justify-content-between">
            <span className="text-muted small">© 2025 Polytext</span>
            <span>
            <a href="#" className="text-decoration-none text-muted me-3">Contact</a>
            <a href="#" className="text-decoration-none text-muted">GitHub</a>
            </span>
        </div>
        </footer>

        
        
        </>
            

    );

return footReturn;
}




 
export default NavBar;
export {TopNavBar, CardCreator, Footer};