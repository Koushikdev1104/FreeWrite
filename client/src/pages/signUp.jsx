import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useContext } from "react";
import authenticatedContext from "../context/authenticated-context";
import { useNavigate} from "react-router-dom";
import "../styles/forms.css";
import { useToasts } from "react-toast-notifications";

function SignUpForm(props){

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {authenticated, setAuthenticated} = useContext(authenticatedContext);
    const {addToast} = useToasts();
    const navigate = useNavigate();

    useEffect(
        () => {
            if(authenticated){
                navigate("/explore/1");
            }
        }, [authenticated]);

    function handleSubmit(event){
        event.preventDefault();

        if(username.length < 8 || password.length < 8){
            addToast("Username and passowrd should have atleast 8 characters", {appearance: 'warning', autoDismiss: true});
            return;
        }

        Axios({
            method: "POST",
            data: {
                name: name,
                username: username,
                password: password,
                email: email
            },
            withCredentials: true,
            url: "/api/users/register",
          }).then((res) => {
              if(!res.data.errors && res.data.userCreated){
                addToast("User Created Successfully", {appearance: "success", autoDismiss: true});
                navigate("/login");
              }else{
                addToast(res.data.message, {appearance: "error", autoDismiss: true});
                console.error(res.data.error);
              }
          }).catch(err => {
              console.error(err);
              addToast("There was an error signing up. Check the console for more details.", {appearance: "error", autoDismiss: true});
            });
    }

    if(authenticated){
        return null;
    }else{
        return (
            <form onSubmit={handleSubmit} action="#" method="NONE">
                <div className="container">
                    <h1 className="form-title">Sign Up to Blog!</h1>
                    <span className="horizontal-line">  </span>
                    <div className="input-container">
                        <label className="form-label" htmlFor="username" >Username</label>
                        <input className="form-input" type="text" name="username" onChange={(event) => {setUsername(event.target.value)}} value={username || ""}  autoComplete="off" required/>
                    </div>
                    <div className="input-container">
                        <label className="form-label" htmlFor="name" >Name</label>
                        <input className="form-input" type="text" name="name" onChange={(event) => {setName(event.target.value)}} value={name || ""} autoComplete="off"/>
                    </div>
                    <div className="input-container">
                        <label className="form-label" htmlFor="mail" >Email</label>
                        <input className="form-input" type="email" name="mail" onChange={(event) => {setEmail(event.target.value)}} value={email || ""} autoComplete="off" required/>
                    </div>
                    <div className="input-container">
                        <label className="form-label" htmlFor="password" >Password</label>
                        <input className="form-input" type="password" name="password" onChange={(event) => {setPassword(event.target.value)}} value={password || ""} autoComplete="off" required/>
                    </div>
                    <button className="submit-button" type="submit" name="submit">Sign Up</button>
                </div>
            </form>
        );
    }
}

export default SignUpForm;
