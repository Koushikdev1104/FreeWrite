import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import  Axios  from "axios";
import "../styles/profile.css";
import authenticatedContext from "../context/authenticated-context";
import Nothing from "../components/Nothing";
import { useToasts } from "react-toast-notifications";

function ProfilePage(props){

    const {authenticated, setAuthenticated} = useContext(authenticatedContext);
    const {addToast} = useToasts();

    const [data, setData] = useState({
        name: "",
        email: "",
        bio: ""
    });


    useEffect( ()=>{
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api/users/user"
            }).then((res) => {
                if(!res.data.errors && !!res.data){
                    setData(res.data.user);
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch(err => {
                console.error(err);
                addToast("There was an error retrieving data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
      }, []);

    if(authenticated){
        return(
            <div className="profile-container">
                <div className="profile-left">
                    <div className="profile-pic">
                        <img style={{width: "stretch", height: "stretch"}} src={"https://ui-avatars.com/api/name=" + (!!data.name ? data.name.split(" ")[0] : "User") + "&background=random&rounded=true&size=250"} />
                    </div>
                    <button className="generic-button">
                        <Link className="link" to="/profile/edit">Edit Details</Link>
                    </button>
                    <button className="generic-button">Change Password</button>

                </div>
                <div className="profile-right">
                    <div className="profile-element">
                        <h3>Name: </h3>
                        <p>{!!data.name ? data.name : "Please Login."}</p>
                    </div>
                    <div className="profile-element">
                        <h3>Email: </h3>
                        <p>{!!data.email ? data.email : "Please Login."}</p>
                    </div>
                    <div className="profile-element">
                        <h3>Bio: </h3>
                        <p>{!!data.bio ? data.bio : "Bio not set yet!"}</p>
                    </div>
                </div>
            </div>
        );
    }else {
        return (<Nothing />);
    }


}

export function EditProfilePage(props){

    const [name, setName] = useState("");
    const [mail, setMail] = useState("");
    const [bio, setBio] = useState("");
    const {addToast} = useToasts();
    const navigate = useNavigate();

    const {authenticated, setAuthenticated} = useContext(authenticatedContext);

    useEffect( ()=>{

        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api/users/user"
            }).then((res) => {
                if(!res.data.errors && !!res.data){
                    const data = res.data.user;
                    setName(data.name);
                    setMail(data.email);
                    setBio(data.bio);
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch(err => {
                console.error(err);
                addToast("There was an error retrieving data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
      }, []);

    function handleClick(event){

        Axios({
            method: "PATCH",
            withCredentials: true,
            data: {
                name: name,
                email: mail,
                bio: bio
            },
            url: "/api/users/user/update"
        }).then((res) => {
            if(!res.data.errors){
                console.log(res.data);
                addToast(res.data.message, {appearance: "success", autoDismiss: true, onDismiss: (id) => {navigate("/profile")}});
            }else{
                addToast(res.data.message, {appearance: "error", autoDismiss: true});
            }
        }).catch((error) => {
            console.error(error);
            addToast("There was an error updaring data. See console for more details.", {appearance: "error", autoDismiss: true});
        });
    }


    if(authenticated){
        return (
            <div className="profile-container">
                <div className="profile-left">
                    <div className="profile-pic">
                        <img style={{width: "stretch", height: "stretch"}} src={"https://ui-avatars.com/api/name=" + (!!name ? name.split(" ")[0] : "User") + "&background=random&rounded=true&size=250"} />
                    </div>
                    {/* <button className="generic-button" onClick={handleClick}>Update Details</button> */}
                    <button className="generic-button">Change Password</button>

                </div>
                <div className="profile-right">
                    <div className="input-container">
                        <label className="form-label" htmlFor="name" >Name: </label>
                        <input className="form-input" type="text" name="name" onChange={(event) => {setName(event.target.value)}} value={name || ""} autoComplete="off"/>
                    </div>
                    <div className="input-container">
                        <label className="form-label" htmlFor="name" >Email: </label>
                        <input className="form-input" type="email" name="name" onChange={(event) => {setMail(event.target.value)}} value={mail || ""} autoComplete="off"/>
                    </div>
                    <div className="input-container">
                        <label className="form-label" htmlFor="name" >Bio: </label>
                        <input className="form-input" type="text" name="name" onChange={(event) => {setBio(event.target.value)}} value={bio || ""} autoComplete="off"/>
                    </div>
                    <div className="update-button-container" >
                        <button className="generic-button update-button" onClick={handleClick}>Update Details</button>
                    </div>

                </div>
            </div>
        );
    }else{
        return (<Nothing />);
    }
}

export default ProfilePage;
