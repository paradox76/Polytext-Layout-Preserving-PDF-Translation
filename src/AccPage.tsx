import { useState, useEffect, useContext } from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { authContext, serverAddress } from "./App";


let lastMenu: any = null;

function setActive(activate: any) {



    if (lastMenu == null) {

        lastMenu = document.querySelector(".defaultt");
    }
    if (activate != lastMenu) {
        activate.classList.add('active', 'bg-danger', 'text-white', 'defaultt');
        lastMenu.classList.remove('active', 'bg-danger', 'text-white', 'defaultt');

        lastMenu = activate;
    }

}
const AccPage = () => {

    const navigator = useNavigate();
    const { authStatus } = useContext(authContext);
    const [bkmrkList, setbkmrkList] = useState([]);

    useEffect(() => {

        const bookmarkList = fetch(serverAddress + "api/bookmarks", {

            method: "POST",
            body: JSON.stringify(authStatus),
            headers: {

                "Content-Type": "application/json"

            }

        });
        bookmarkList.then(async (p) => {

            const pparsed = await p.json();
            setbkmrkList(pparsed);


        });


    }, []);


    lastMenu = null;


    const accTopBar = (<>
        <div className="container mt-4">
            <ul className="nav nav-pills d-flex justify-content-evenly p-3 rounded" style={{ backgroundColor: 'rgba(52, 58, 64, 0.7)' }}>
                <li className="nav-item">
                    <button className={`nav-link text-light ${(window.location.pathname == '/auth/profile') ? 'active bg-danger text-white defaultt' : ''}`} onClick={(e) => {

                        // setActive(e.currentTarget);

                        navigator('/auth/profile')
                    }}>
                        📊 Profile
                    </button>

                </li>
                <li className="nav-item">
                    <button className={`nav-link text-light ${(window.location.pathname == '/auth/upload') ? 'active bg-danger text-white defaultt' : ''}`} onClick={(e) => {
                        navigator('/auth/upload');
                    }}>
                        📚 Upload Books
                    </button>
                </li>

                <li className="nav-item">
                    <button className={`nav-link text-light ${(window.location.pathname == '/auth/bookmarks') ? 'active bg-danger text-white defaultt' : ''}`} onClick={(e) => {

                        navigator('/auth/bookmarks')

                    }}>
                        ⚙️ Bookmarks
                    </button>
                </li>
            </ul>
        </div>
    </>);








    return (<>
        {accTopBar}
        <Outlet context={[bkmrkList, setbkmrkList]}></Outlet>
    </>);
}



// all the nested children components are below, the ones that will be the outlet above
const AccInfo = () => {

    const { authStatus } = useContext(authContext);
    const profile = useState(authStatus);

    return (<>
        <div className="container" style={{ marginTop: '5%', marginBottom: '10%' }}>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="rounded p-4" style={{ background: "oklch(0.21 0.015 255)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                        <form name="profile" onSubmit={
                            async (e) => {
                                e.preventDefault();
                                const formdata = new FormData(e.target as HTMLFormElement);
                                const username = formdata.get("username");
                                const response = await fetch(serverAddress + "api/user/username",
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ username, authStatus })
                                    });
                            }
                        }>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: "oklch(0.65 0.02 255)" }}>Email</label>
                                <input
                                    name='email'
                                    type='email'
                                    className="form-control"
                                    placeholder="your@email.com"
                                    value={authStatus.email}
                                    disabled
                                    style={{ background: "oklch(0.18 0.02 255)", border: "1px solid oklch(1 0 0 / 0.1)", color: "oklch(0.65 0.02 255)" }}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "oklch(0.65 0.02 255)" }}>Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter a username"
                                    defaultValue={authStatus.username}
                                    style={{ background: "oklch(0.22 0.015 255)", border: "1px solid oklch(1 0 0 / 0.1)", color: "oklch(0.95 0.005 255)" }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

function Uploader() {
    // const { authStatus, setauthStatus } = useContext(authContext);
    const [uploadMsg, setuploadMsg] = useState({ isVisible: false, Message: "" });
    const [isUploading, setIsUploading] = useState(false);

    let payload: File;
    async function uplaodHandler(event: any) {

        if (!payload) {
            setuploadMsg({ isVisible: true, Message: "Upload a file first! JAckass!" });
            return;
        }
        if (payload.type !== "application/pdf") {


            return;
        }

        if (payload.size >= 31457280) {
            setuploadMsg({ isVisible: true, Message: "File size should be below 30 MB" });
            return;
        }

        const formData = new FormData();
        formData.append("theUpload", payload);

        setIsUploading(true);
        try {
            const uploadRes = await fetch(serverAddress + "books/upload", {
                method: "POST",
                body: formData
            });
            if (!(uploadRes.ok)) {
                setuploadMsg({ isVisible: true, Message: "There seems to be an internal error" });
                return;
            }
            const parsedRes = await uploadRes.text();
            setuploadMsg({ isVisible: true, Message: parsedRes });
            return parsedRes;
        } finally {
            setIsUploading(false);
        }




    }

    return <>
        <input id="uploader" type="file" accept="application/pdf" onChange={(e) => {
            const files = e.target.files;
            payload = files[0];




        }}></input>

        <div style={{
            width: "30%", margin: "auto", aspectRatio: "9/9", borderStyle: "dashed", borderRadius: "8px", borderWidth: "4px", borderColor: "gray",
            color: "GrayText", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center",
            fontSize: "3vw", userSelect: "none", cursor: "pointer"
        }}

            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files[0].type === "application/pdf" && files.length < 2 && files[0].size < 31457280) {

                    const textSpan = e.currentTarget.querySelector('span');
                    textSpan.innerText = files[0].name;

                    payload = files[0];




                }
            }}
        >
            <span> Drag & Drop here</span>
        </div>
        <button className="btn btn-primary w-50 d-block mx-auto mt-3" onClick={uplaodHandler}> Submit</button>
        <div style={{ color: "red", visibility: (uploadMsg.isVisible) ? "visible" : "hidden", textAlign: "center", marginTop: "8px" }}> {uploadMsg.Message}</div>

    </>


}






function BookMarkTab() {
    const [bkmrkList, setbkmrkList] = useOutletContext<any[]>();
    const { authStatus } = useContext(authContext);
    console.log("test : ", bkmrkList);
    const forDelete: any = [];

    const listInputs = bkmrkList.map((v, i) => {

        return <>
            <div className="d-flex align-items-center py-2" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.06)" }}>
                <input type="checkbox" value={v.title} name={"title" + i} key={"title" + i} className="form-check-input me-3" onChange={(e) => {
                    if (e.target.checked) {
                        forDelete[i] = e.target.value;
                    } else {

                        forDelete[i] = undefined;


                    }
                }}></input>
                <label htmlFor={"title" + i} style={{ color: "oklch(0.95 0.005 255)", fontFamily: "Newsreader, serif" }}>{v.title}</label>
            </div>
        </>

    });

    function deleter(e: React.FormEvent<HTMLFormElement>) {

        e.preventDefault();
        //console.log("for delete here: ", forDelete);
        const delRes = fetch(serverAddress + "api/book/delete", {

            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ forDelete, authStatus })



        });
        delRes.then(async (p) => {

            const pparsed = await p.json();
            setbkmrkList(pparsed);


        });

    }

    return (<>
        <div className="container" style={{ marginTop: "5%" }}>
            <form onSubmit={deleter}>
                <div className="rounded p-3" style={{ background: "oklch(0.21 0.015 255)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                    {listInputs}
                </div>
                <button type="submit" className="btn btn-danger mt-3 float-end">Delete selected</button>
            </form>
        </div>
    </>);
}


export default AccPage;
export { AccInfo, Uploader, BookMarkTab };