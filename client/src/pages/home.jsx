import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import img from "../assets/heading-img-2.png"
import SinglePost from "../components/SinglePost";
import authenticatedContext from "../context/authenticated-context";
import PersonIcon from '@mui/icons-material/Person';
import "../styles/nav.css"
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import Loader from "../components/Loader";

function HomePage (props){

    const [posts, setPosts] = useState([]);
    const {addToast} = useToasts();
    const navigate = useNavigate();


    useEffect(() => {
        axios({
            method: "GET",
            withCredentials: true,
            url: "/api/posts/recent/6"
        }).then(res => {
            if(!res.data.errors){
                setPosts(res.data.result);
            }else{
                addToast(res.data.message, {appearance: 'error', autoDismiss: true});
            }
        }).catch(err => {
            console.log(err);
            addToast("There was an error retrieving data. See console for more details!", {appearance: 'error', autoDismiss: true});
        });
    }, []);


    return (
        <div>
            <div className="home-container">
                {/* <TopNav />
                <hr /> */}
                <div className="hero">
                    <div className="left-container">
                        <h1 className="primary-heading">
                            Quench your Curiosity
                        </h1>
                        <h3 className="caption">
                            Explore the stories of different people in the world!
                        </h3>
                        <button type="button" className="read-button" onClick={(event) => {navigate("/explore")}}>Start Reading &gt;&gt;</button>
                    </div>
                    <div className="right-container">
                        <img src={img} alt="What's your story image"/>
                    </div>
                </div>
            </div>
            <div className="posts">
                    {
                        !(posts.length === 0) ?
                        posts.map(function(post){
                            return <SinglePost key={post._id} title={post.title} description={post.description} body={post.body} id={post._id} author={post.author} />
                        }) :
                        <Loader />
                    }
                    {
                        !(posts.length === 0)
                        ?
                            <h3 className="view-more"><a href="/explore/1">View More &gt;&gt;&gt;</a></h3>
                        : null
                    }
            </div>
            <div className="footer">
                <ul className="footer-item">
                    <li>Explore</li>
                    <li> <a href="/explore/1">New Posts</a> </li>
                    <li> <a href="/explore/1">Popular Posts</a> </li>
                    <li>Search Posts</li>
                </ul>
                <ul className="footer-item">
                    <li>Follow</li>
                    <li>Facebook</li>
                    <li>Instagram</li>
                    <li>Linkedin</li>
                </ul>
                <ul className="footer-item">
                    <li>About</li>
                    <li>This Project</li>
                </ul>
            </div>
        </div>

    );
}

export function TopNav(props) {

    const {authenticated, setAuthenticated, user, setUser} = useContext(authenticatedContext);
    const navigate = useNavigate();
    const {addToast} = useToasts();

    function logout(event){
        axios({
            method: "POST",
            withCredentials: true,
            url: "/api/users/logout"
        }).then(res => {
            if(!!res.data && !res.data.errors ){
                if(res.data.authenticated){
                    setAuthenticated(true);
                }else{
                    setAuthenticated(false);
                    setUser({});
                    addToast(res.data.message, {appearance: 'success', autoDismiss: true});
                    navigate("/explore/1");
                }
            }else{
                addToast(res.data.message, {appearance: 'error', autoDismiss: true});
            }
        }).catch((err) => {
            console.error(err);
            addToast("There was an error logging out. See console for more details!", {appearance: 'error', autoDismiss: true});
        });
    }

    return(
        <div>
            <nav>
                <h1 className="nav-title" onClick={() => {navigate("/home")}}>Blog</h1>
                {
                    authenticated ?
                    <div>
                        <p className="welcome-user">
                           { "Hello, " + ((authenticated && Object.keys(user).length === 0) ? "User" : user.name.split(" ")[0]) + "!"}
                        </p>
                        <div className="menu">
                            <PersonIcon className="dropdown-btn"/>
                            <div className="dropdown-content">
                                <Link className="dropdown-item" to="/explore">Explore</Link>
                                <Link className="dropdown-item" to="/my-posts">My Posts</Link>
                                <Link className="dropdown-item" to="/profile">Profile</Link>
                                <Link className="dropdown-item" to="/posts/create-post">Create Post</Link>
                                <p className="dropdown-item" onClick={logout}> Logout </p>
                            </div>
                        </div>
                    </div>
                :
                    <ul>
                        <li><Link className="nav-link" to="/login">Login</Link> </li>
                        <li><Link className="nav-link" to="/signup">Sign Up</Link></li>
                    </ul>
                }

            </nav>
            <hr />
            <Outlet />
        </div>
    )
}

export default HomePage;
