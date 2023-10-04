import React, { useState, useEffect } from "react";
import "../styles/post.css"

function SinglePost(props){
    
    const [showEdit, setShowEdit] = useState(false);

    useEffect(()=>{
        if(typeof props.edit != 'undefined'){
            setShowEdit(props.edit);
        }
    }, []);

    return (
        <div className="post-container">
            <h1>{!!props.title ? props.title : "Heading"}</h1>
            <h3>{!!props.description ? props.description : "Description"}</h3>
            <p>
            {!!props.body ? (props.body.slice(0, 220) + "...") : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it "}
            </p>
            <div className={"options-container" + (showEdit ? " show-edit" : "")}  >
                <a href={"/posts/" + (!!props.id ? props.id : "")}>Read more</a>
                <a className={showEdit ? "show-edit-button" : "hide-edit-button"} href={"/posts/edit-post/" + (!!props.id ? props.id : "")}>Edit</a>
            </div>
        </div>
    );
}

export default SinglePost;