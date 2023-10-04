import Axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import Nothing from "../components/Nothing";
import authenticatedContext from "../context/authenticated-context";
import CloseIcon from '@mui/icons-material/Close';

// For select dropdown
import {options} from "./options";
import {tagOptions} from "./tags";
import Select from "react-dropdown-select";

import "../styles/create-post.css";

function CreatePost(props) {

    const [body, setBody] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const {authenticated, setAuthenticated} = useContext(authenticatedContext);
    const [tags, setTags] = useState([]);
    const navigate = useNavigate();

    const {addToast} = useToasts();

    const [value, setValue] = useState([{label: "Select Category...", value: ""}]);

    function handleTitleChange(event){
        setTitle(event.target.value);
    }

    function handleDescriptionChange(event){
        setDescription(event.target.value);
    }

    function handleBodyChange(event){
        setBody(event.target.value);
    }

    function handleSubmit(event){

        let t = [];
        
        tags.map((element) => {
            t.push(element.value);
        });

        if(!!title && !!body && !!description){
            Axios({
                method: "POST",
                withCredentials: true,
                data: {
                    title: title,
                    body: body,
                    description: description,
                    category: value.length !== 0 ? value[0].value : "",
                    tags: t
                },
                url: "/api/posts/create",
            }).then((res) => {
                if(!res.data.errors){
                    addToast(res.data.message, {appearance: "success", autoDismiss: true});
                    navigate("/my-posts");
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch((err) => {
                console.error(err);
                addToast("There was an error creating the post. See console for more details.", {appearance: "error", autoDismiss: true});
            });
        } else{
            console.log("Invalid values");
            addToast("Please Check the values! They should not be empty", {appearance: 'warning', autoDismiss: true});
        }

    }

    function handleCancel(event){
        setTitle("");
        setDescription("");
        setBody("");
    }

    function changeCategory(options){
        setValue(options);
    }

    function changeTags(options){
        setTags(options);
    }

    // function addTag(event){
    //     if(typeof event.key !== 'undefined'  && (event.key === 'Tab' || event.key === 'Enter') && tag.trim().length !== 0){
    //         const newTags = tags.slice();
    //         newTags.push(tag);
    //         setTags(newTags);
    //         setTag("");
    //     }
    // }

    function removeTag(ele, idx){
        const newTags = tags.slice();
        newTags.splice(idx, 1);
        setTags(newTags);
    }


    if(authenticated){
        return (
            <div className="top-container">
                <h1> Create Post </h1>
                <div className="create-container">
                    <input name="title" className="create-post-text" type="text" value={title} onChange = {handleTitleChange} placeholder="Title"/>
                    <input name="description" className="create-post-text" type="text" value={description} onChange={handleDescriptionChange} placeholder="Description"/>
                    <textarea name="content" value={body} onChange = {handleBodyChange} placeholder="Content of the post"/>
                    <Select className="select-categories create-post-select" options={options} dropdownPosition="auto" searchable="true" clearable="true" direction="ltr" onChange={changeCategory} values={value} />
                    <div className="tags-container">
                        {/* {
                            (typeof tags !== 'undefined') ? tags.map((element, idx) => {
                                return <div key={idx} className="tag-container">
                                            <span className="tag-content">
                                                {element.value}
                                            </span>
                                            <CloseIcon className="tag-cross" onClick={(event) => {
                                                removeTag(element.value, idx);
                                            }} />
                                        </div>
                            }) : null
                        } */}
                        <Select className="select-tags" multi="true" options={tagOptions} dropdownPosition="auto" searchable="true" clearable="true" direction="ltr" color="#30E3CA" onChange={changeTags} values={tags} placeholder="Add Tag..." />
                        {/* <input type="text"  name="tag-input" className="tag-input" value={tag} onChange={(event) => {setTag(event.target.value)}} onKeyDown={addTag} placeholder="Add Tag..."  /> */}
                    </div>
                </div>
                <div className="buttons-container">
                    <button className="generic-button" onClick={handleCancel}>Cancel</button>
                    <button className="generic-button" onClick={handleSubmit}>Create Post</button>
                </div>

            </div>
        );
    }else{
        return <Nothing />
    }
}

export function EditPost(props) {

    const [body, setBody] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const {addToast} = useToasts();
    const navigate = useNavigate();
    const params = useParams();

    const {authenticated, setAuthenticated} = useContext(authenticatedContext);
    const [value, setValue] = useState([{label: "Select Category...", value: ""}]);


    //get post data
    useEffect(()=>{

        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api/posts/" + params.postId + "/edit/"
        }).then((res) => {
            if(res.data.errors === 0){
                setTitle(res.data.post.title);
                setBody(res.data.post.body);
                setDescription(res.data.post.description);
                setValue((res.data.post.category && res.data.post.category !== "") ? [options.find( o => o.value === res.data.post.category)] : [{label: "Select Category...", value: ""}]);
            }else{
                addToast(res.data.message, {appearance: "error", autoDismiss: true});
                console.error(res.data.error);
            }

        }).catch(err => {
            console.error(err);
            addToast("There was an error retrieving the data. See console for more details.", {appearance: "error", autoDismiss: true});
        });

    }, []);

    function handleTitleChange(event){
        setTitle(event.target.value);
    }

    function handleDescriptionChange(event){
        setDescription(event.target.value);
    }

    function handleBodyChange(event){
        setBody(event.target.value);
    }

    function changeCategory(options){
        setValue(options);
    }

    function handleSubmit(event){
        if(!!title && !!body && !!description){
            Axios({
                method: "PATCH",
                withCredentials: true,
                data: {
                    title: title,
                    body: body,
                    description: description,
                    category: value[0].value
                },
                url: "/api/posts/" + params.postId + "/update",
            }).then((res) => {
                if(res.data.errors === 0){
                    addToast(res.data.message, {appearance: "success", autoDismiss: true});
                    navigate("/my-posts");
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch((err) => {
                console.error(err);
                addToast("There was an error updating data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
        } else{
            addToast("Please Check the values! They should not be empty", {appearance: 'warning', autoDismiss: true});
        }
    }

    function handleDelete(event){
        Axios({
            method: "DELETE",
            withCredentials: true,
            url: "/api/posts/" + params.postId + "/delete"
        }).then((res) => {
            if(res.data.errors === 0){
                addToast(res.data.message, {appearance: "success", autoDismiss: true});
                navigate("/my-posts");
            }else{
                addToast(res.data.message, {appearance: "error", autoDismiss: true});
            }
        }).catch(err => {
            console.error(err);
            addToast("There was an error updating data. See console for more details.", {appearance: "error", autoDismiss: true});
        });
    }

    if(authenticated){
        return (
            <div className="top-container">
                <h1> Edit Post </h1>
                <div className="create-container">
                    <input name="title" type="text" value={title} onChange = {handleTitleChange} placeholder="Title"/>
                    <input name="description" type="text" value={description} onChange={handleDescriptionChange} placeholder="Description"/>
                    <textarea name="content" value={body} onChange = {handleBodyChange} placeholder="Content of the post"/>
                    <Select className="select-categories create-post-select" options={options} dropdownPosition="auto" searchable="true" clearable="true" direction="ltr" onChange={changeCategory} values={value} />

                </div>
                <div className="buttons-container">
                    <button className="generic-button" onClick={handleDelete}>Delete Post</button>
                    <button className="generic-button" onClick={handleSubmit}>Apply Changes</button>
                </div>

            </div>
        );
    }else{
        return <Nothing />;
    }
}

export default CreatePost;
