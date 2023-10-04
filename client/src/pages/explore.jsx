import React, { useEffect, useState } from "react";
import Axios from "axios";
import SinglePost from "../components/SinglePost";
import "../styles/explore.css";
import { useNavigate, useParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

import {options} from "./options";
import Select from "react-dropdown-select";
import Loader from "../components/Loader";

function ExplorePosts(props){

    const params = useParams();
    const [page, setPage] = useState(parseInt(params.page));
    const [isLastPage, setIsLastPage] = useState(false);
    const navigate = useNavigate();
    const [clicked, setClicked] = useState(!!props.type ? 0 : 1);
    const [posts, setPosts] = useState([]);
    const url = !clicked ? "/posts/sort/recent/" : "/posts/sort/popular/";
    const {addToast} = useToasts();
    const allOptions = [{label: "All", value:"all"}, ...options];
    const [value, setValue] = useState([{label: "All", value: "all"}]);
    const category = (value.length === 0 ? "all" : value[0].value);
    const isTags = Boolean(props.tags);
    const tag = params.tag ? params.tag : "";
    const [showLoader, setShowLoader] = useState(true);
    
    useEffect(() => {
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api" + url + page + (isTags ? "/tags/" : "/category/") + (isTags ? tag : category)
        }).then(
            res => {
                setShowLoader(false);
                if(!res.data.errors){
                    setPosts(res.data.result);
                    if(res.data.result.length < 12){
                        setIsLastPage(true);
                    }
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }
        ).catch(err => {
            console.error(err);
            addToast("There was an error retrieving data. See console for more details.", {appearance: "error", autoDismiss: true});
        });

    }, [url, category, tag]);

    useEffect(() => {
        navigate("/explore/"+page + (isTags ? "/tags/" + tag : ""));
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api" + url + page + (isTags ? "/tags/" : "/category/") + (isTags ? tag : category)
        }).then(
            res => {
                if(!res.data.errors){
                    setPosts(res.data.result);
                    if(res.data.result.length < 12){
                        setIsLastPage(true);
                    }else{
                        setIsLastPage(false);
                    }
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }
        ).catch(err => {
            console.error(err);
            addToast("There was an error retrieving data. See console for more details.", {appearance: "error", autoDismiss: true});
        });
    }, [page]);

    function handleRecentClick(event){
        setClicked(0);
    }

    function handlePopularClick(event){
        setClicked(1);
    }

    function decreasePage(event){
        if(params.page > 1){
            setPage(page-1);
        }
    }

    function increasePage(event){
        if(!isLastPage){
            setPage(page+1);
        }
    }

    function changeCategory(options){
        setValue(options);
    }

    return (
        <div className="explore-container">
            {/* <h1>Dashboard</h1> */}
            <div className="sort-options-container">
                {
                    !isTags ?
                        <div style={{display: "flex", alignItems: "center"}}>
                            <p className="sort-categories-label">Sort by Category: </p>
                            <Select className="select-categories" options={allOptions} dropdownPosition="auto" placeholder="Select Category.." searchable="true" clearable="true" direction="ltr" onChange={changeCategory} values={value} />
                        </div>
                    :
                    null

                }
                <span className={"sort-type-button" + (clicked ? "" : " sort-button-clicked")} onClick={handleRecentClick}>Recent</span>
                <span className={"sort-type-button" + (!clicked ? "" : " sort-button-clicked")} onClick={handlePopularClick}>Popular</span>
            </div>
            <div className="posts">
                {
                    (!!posts && !(posts.length === 0)) ?
                    posts.map(function(post){
                        return <SinglePost key={post._id} title={post.title} description={post.description} body={post.body} id={post._id} author={post.author} />
                    })
                    :
                    (showLoader) ? <Loader /> : null
                }
            </div>
            <div className="navigate-buttons-container">
                <button className={"navigate-button" + ((page == 1) ? " grayed-out" : "")} onClick={decreasePage}>Previous</button>
                <button className={"navigate-button" + (isLastPage ? " grayed-out" : "")} onClick={increasePage}> Next</button>
            </div>
        </div>
    );
}

export default ExplorePosts;
