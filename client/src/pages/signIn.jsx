import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import authenticatedContext from "../context/authenticated-context";
import "../styles/forms.css";
import Nothing from "../components/Nothing";
import { useToasts } from "react-toast-notifications";

function SignInForm(props){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const {addToast} = useToasts();
    const {authenticated, setAuthenticated, user, setUser} = useContext(authenticatedContext);
    const navigate = useNavigate();

    useEffect(
        () => {
            if(authenticated){
                navigate("/explore/1");
            }
        }, [authenticated]
    )

    function handleSubmit(event){
        event.preventDefault();

        Axios({
            method: "POST",
            data: {
              username: username,
              password: password,
            },
            withCredentials: true,
            url: "/api/users/login",
            }).then((res) => {
                if(res.data.errors === 0){
                    if(res.data.authenticated){
                        setAuthenticated(res.data.authenticated);
                        setUser(res.data.user);
                    }
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                    console.error(res.data.error);
                }
            }).catch(err => {
                console.error(err)
                addToast("There was an error posting the data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
    }

    if(authenticated){
        return <Nothing />
    }else{
        return (
            <form onSubmit={handleSubmit} action="#" method="NONE">
                <div className="container">
                    <h1 className="form-title">Sign In to Blog!</h1>
                    <span className="horizontal-line">  </span>
                    <div className="input-container">
                        <label className="form-label" htmlFor="username" >Username</label>
                        <input className="form-input" type="text" name="username"  onChange={(event) => {setUsername(event.target.value)}} value={username || ""}  autoComplete="off" required/>
                    </div>
                    <div className="input-container">
                        <label className="form-label" htmlFor="password" >Password</label>
                        <input className="form-input" type="password" name="password" onChange={(event) => {setPassword(event.target.value)}} value={password || ""} autoComplete="off" required/>
                    </div>
                    <button className="submit-button" type="submit" name="submit">Log In</button>
                </div>

            </form>
        );
    }


}

export default SignInForm;
