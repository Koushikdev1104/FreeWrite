import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import Loader from "../components/Loader";
import Nothing from "../components/Nothing";
import SinglePost from "../components/SinglePost";
import authenticatedContext from "../context/authenticated-context";

function MyPosts(props){

    const [posts, setPosts] = useState([]);
    const {authenticated, setAuthenticated} = useContext(authenticatedContext);
    const {addToast} = useToasts();

    useEffect(() => {

        axios({
            method: "GET",
            withCredentials: true,
            url: "/api/posts/my-posts"
        }).then(res=>{
            if(!res.data.errors){
                setPosts(res.data.result);
            }else{
                addToast(res.data.message, {appearance: "error", autoDismiss: true});
            }
        }).catch(err => {
            console.error(err);
            addToast("There was an error retrieving data. See console for more details.", {appearance: "error", autoDismiss: true});

        });

    }, []);


    if(!authenticated){
        return (<Nothing />);
    }else{
        return (
            <div className="posts">
                {
                    posts && posts.length !== 0 ?
                        posts.map(function(post){
                            return <SinglePost key={post._id} edit={true} title={post.title} description={post.description} body={post.body} id={post._id} author={post.author} />
                        }) :
                        <Loader />
                }
            </div>
        );
    }

}

export default MyPosts;
