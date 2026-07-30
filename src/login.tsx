import { useContext, useState } from "react";
import { authContext, LoginContext } from "./App";
import { createPortal } from "react-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { serverAddress } from "./App";


// the whole login component
const Login = (propState: any) => {
    const curstate = useContext(LoginContext);
    const {  setauthStatus } = useContext(authContext);

    const closeLog = propState.closeLogin;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setisLogin] = useState(true);

    function typeEvent(e: any) {

        setEmail(e.target.value);


    }

    function typePass(pevent: any) {

        setPassword(pevent.target.value);

    }


    //function that runs when we submit the account form                                                        
    async function onsubmit(e: any) {
        e.preventDefault();
        if (!isLogin) {
            const confField = document.getElementById("confpwd") as HTMLInputElement;
            const conf = confField.value;

            if (password !== conf) {
                confField.value = "";
                // confField.placeholder = "Password doesnt match";
                confField.classList.add("border-danger");
                const errorSpan = document.getElementById("conf-error") as HTMLElement;

                errorSpan.style.display = "block";


                return;

            }


        }


        //here********************************************************************************

        const response = await fetch(serverAddress + "api/user/login/" + (isLogin ? "login" : "signup"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
            ,
            body: JSON.stringify({ userEmail: email, userPassword: password })

        });



        const responseBody = await response.json();
        console.log(response.ok + " and ", responseBody);

        const loginMsg = document.getElementById("login-error") as HTMLElement;
        if (response.ok || responseBody.existFlag) {
            loginMsg.style.color = "blue";
            loginMsg.style.display = "block";
            loginMsg.innerText = responseBody.message;



            setauthStatus(responseBody);
            closeLog();
        } else {

            loginMsg.style.display = "block";
            loginMsg.innerText = responseBody.message;


        }

    }


    // logic of switching between login and signup
    let formType;

    if (isLogin) {
        formType = (
            <>
                <span style={{ display: "block" }} id="login-error" className="text-danger small"></span>

                <br></br>
                <span>
                    <a href="#" onClick={(e) => { e.preventDefault; setisLogin(false); }} >Dont have account? Create one.</a>
                </span>
            </>
        );


    } else {
        formType = (
            <>
                <br></br>
                <input className="form-control" type="password" id="confpwd" name="confpwdkey"
                    placeholder="Confirm Password" onChange={() => {
                        const errorSpan = document.getElementById("conf-error") as HTMLElement;
                        if (errorSpan.style.display == "block") {

                            errorSpan.style.display = "none";


                        }


                    }}></input>

                <span style={{ display: "none" }} id="conf-error" className="text-danger small">Passwords don't match</span>
                <span style={{ display: "none" }} id="login-error" className="text-danger small"></span>
                <br></br>
                <span>
                    <a href="#" onClick={(e) => { e.preventDefault; setisLogin(true); }} >Already have account? Login.</a>
                </span>
            </>

        );

    }

    // jsx returned to create the modal
    const logpage = createPortal(
        <>
            <div className="modal fade show d-block" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">{isLogin ? "Log In" : "Create Account"}</h5>
                            <button className="btn-close" type="button" onClick={closeLog}></button>
                        </div>
                        <br />
                        <div className="modal-body">

                            <form onSubmit={onsubmit} autoComplete="on" name="login"
                                title="this is a from tooltip lol">

                                <input className="form-control" type="email" id="emailid" name="emailkey" placeholder="Email"
                                    value={email} onChange={typeEvent}
                                ></input><br></br>
                                <input className="form-control " type="password" id="pwd" name="pwdkey" placeholder="Password"
                                    value={password} onChange={typePass}
                                ></input>


                                {formType}




                                <div className="modal-footer justify-content-center">
                                    <button className="btn btn-primary" type="submit">Submit</button>

                                </div>

                            </form>

                        </div>
                        <br />
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show "></div>
        </>,
        document.body

    )





    if (curstate == false) { return ""; }
    return logpage;
};


export default Login;