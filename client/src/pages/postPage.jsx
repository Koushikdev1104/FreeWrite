import React, { useContext, useEffect, useState } from "react";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ReplyIcon from '@mui/icons-material/Reply';
import "../styles/post-page.css";
import "../styles/comments.css";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";
import authenticatedContext from "../context/authenticated-context";
import { useToasts } from "react-toast-notifications";
import Loader from "../components/Loader";

function Post(props){

    const params = useParams();
    const [postId, setPostId] = useState(!!params.postId? params.postId : "");
    const [postData, setPostData] = useState({});
    const [body, setBody] = useState("");
    const {user} = useContext(authenticatedContext);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [tags, setTags] = useState(["post"]);
    const {addToast} = useToasts();

    // download post data on start
    useEffect(()=>{
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api/posts/" + postId
        }).then((res)=>{
            if(!res.data.errors){
                setPostData(res.data.result);
                setBody(res.data.result.body);
                setLikes(res.data.result.favouritesCount);
                if(Object.keys(res.data.result).includes("tags")){
                    let newTags = tags.slice();
                    newTags = [...newTags, ...res.data.result.tags];
                    setTags(newTags);
                }
            }else{
                addToast(res.data.message, {appearance: "error", autoDismiss: true});
            }
        }).catch((err)=>{
            console.error(err);
            addToast("There was an error retrieving data. See console for more details.", {appearance: "error", autoDismiss: true});
        });
    }, [postId]);

    //set liked on start
    useEffect(() => {
        if(typeof user != "undefined" && !(Object.keys(user).length === 0)  && user.favourites.includes(postId)){
            setLiked(true);
        }
    }, [user]);

    function handleClick(event){
        if(!liked){
            Axios({
                method: "PATCH",
                withCredentials: true,
                data: {},
                url: "/api/posts/" + postId + "/like"
            }).then((res) => {
                if(!res.data.errors){
                    setLiked(true);
                    setLikes(likes+1);
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch(err => {
                console.error(err);
                addToast("There was an error updating data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
        }else{
            Axios({
                method: "PATCH",
                withCredentials: true,
                data: {},
                url: "/api/posts/" + postId + "/unlike"
            }).then((res) => {
                if(!res.data.errors){
                    setLiked(false);
                    setLikes(likes-1);
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch(err => {
                console.error(err);
                addToast("There was an error updating data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
        }
    }


    return (
    <div className="post-page-container">
        {
            !(Object.keys(postData).length === 0) ? 
                <div>
                    {(Object.keys(postData).length === 0) ? null :<AuthorCard createdAt = {postData.createdAt} authorId = {postData.author} />}
                    <h1>{postData.title}</h1>
                    <h3>{postData.description}</h3>
                    {
                        body.split("\n").map(function(element, idx){
                            return <p key={idx}>{element}</p>;
                        })
                    }
                </div>
             :
            <Loader />
        }

        <div className="icon-container">
            <ThumbUpIcon className={"like-icon" + (liked?" liked":"")} onClick={handleClick}/>
            <div className="likes-number">{likes ? likes : 0} likes</div>
        </div>

        <div className="tags-section">
            <p className="tag-heading">Tags: </p>
            {
                tags ? tags.map((ele, idx) => {
                    return <Tag key={idx} tagContent={ele} />
                }) : null
            }

        </div>
        <CommentsSection postId = {postId} />

    </div>);
}

export function AuthorCard(props){

    const [authorId, setAuthorId] = useState(props.authorId);
    const createdAt = props.createdAt;
    const [author, setAuthor] = useState({});
    const toDate = new Date(createdAt);
    const [following, setFollowing] = useState(false);
    const {user} = useContext(authenticatedContext);
    const {addToast} = useToasts();

    // populate author
    useEffect(() => {

        Axios({
            method: "GET",
            withCredentials: true,
            url: `/api/users/user/${authorId}`
        }).then((res) => {
            if(!res.data.errors){
                setAuthor(res.data.user);
            }else{
                addToast(res.data.message, {appearance: "error", autoDismiss: true});
            }
        }).catch(err => {
            console.error(err);
            addToast("There was an error retrieving data. See console for more details.", {appearance: "error", autoDismiss: true});
        });

    }, [authorId]);

    //set following at the start
    useEffect(() => {
        if(typeof user != "undefined" && !(Object.keys(user).length === 0)  && user.following.includes(authorId)){
            setFollowing(true);
        }
    }, [user]);

    function followAuthor(event){
        //follow and unfollow author
        if(!following){
            Axios({
                method: "PATCH",
                withCredentials: true,
                url: "/api/users/follow/" + authorId
            }).then(res => {
                if(!res.data.errors){
                    setFollowing(true);
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch(err => {
                console.error(err);
                addToast("There was an error updating data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
        }else{
            Axios({
                method: "PATCH",
                withCredentials: true,
                url: "/api/users/unfollow/" + authorId
            }).then(res => {
                if(!res.data.errors){
                    setFollowing(false);
                }else{
                    addToast(res.data.message, {appearance: "error", autoDismiss: true});
                }
            }).catch(err => {
                console.error(err);
                addToast("There was an error updating data. See console for more details.", {appearance: "error", autoDismiss: true});
            });
        }

    }

    return (
        <div className="author-card-container">
            <div className="author-profile-container">
                <img style={{width: "stretch", height: "stretch"}} src={"https://ui-avatars.com/api/name=" + (!!author.name ?author.name.split(" ")[0] : "User") + "&background=random&rounded=true"} />
                <div className="author-details-container">
                    <p>{author.name}</p>
                    <p>{toDate.toDateString()}</p>
                </div>
            </div>

            <button className={"follow-button" + (following ? " following" : "")} onClick={followAuthor}>{ following ? "Following" : "Follow"}</button>
        </div>
    );

}

export const CommentsSection = React.memo(function (props){

    const {authenticated, setAuthenticated, user} = useContext(authenticatedContext);
    const navigate = useNavigate();
    const postId = props.postId;
    let firstName = "";
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);

    if(Object.keys(user).length > 0){
        firstName = user.name.split(" ")[0];
    }else{
        firstName = "User";
    }

    //get comments for the current post.
    useEffect(() => {
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api/comments/"+postId
        }).then((res) => {
            if(res.data.errors === 0){
                setComments(res.data.result);
            }else{
                console.error(res.data.messgage);
            }
        }).catch(err => {
            console.error(err);
        })
    }, []);

    function refreshComments(){
        Axios({
            method: "GET",
            withCredentials: true,
            url: "/api/comments/"+postId
        }).then((res) => {
            if(res.data.errors === 0){
                setComments(res.data.result);
            }else{
                console.error(res.data.messgage);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    function postComment(event){
        Axios({
            method: "POST",
            withCredentials: true,
            data: {
                postId: postId,
                text: text,
                parentAuthorName: ""
            },
            url: "/api/comments/new"
        }).then(res => {
            if(!res.data.errors && typeof res.data.result !== 'undefined'){
                refreshComments();
            }else{
                console.error(res.data.message);
            }
            setText("");
        }).catch(err => {
            console.error(err);
            setText("");
        });
    }

    return (
        <div className="comments-section">
            <hr className="comments-top-margin" />
            {authenticated
            ?<div className="post-comment-container">
                <img src={`https://ui-avatars.com/api/name=${firstName}&background=random&rounded=true`}/>
                <input className="comment-input" type="text" placeholder="Type your comment here!" value={text} onChange={(event) => {setText(event.target.value)}}/>
                <button className="comments-post-button" onClick={postComment} >Post</button>
            </div>
            :<div className="login-signup-conatiner">
                <p className="comment-notice">Login or Signup to leave a comment</p>
                <div>
                    <button className="comments-login-button" onClick={(event) => {navigate("/login")}}>Log In</button>
                    <button className="comments-signup-button" onClick={(event) => {navigate("/signup")}}>Sign Up</button>
                </div>
            </div>
            }
            <div className="comments">
                {
                    comments.map(function(ele){
                        return <Comment key={ele.comment._id} data={ele} refreshComments={refreshComments} />
                    })
                }
                {/* <Comment />
                <Comment margin="1" />
                <Comment />
                <Comment margin="1" />
                <Comment margin="2" />
                <Comment margin="2" />
                <Comment margin="1" /> */}

            </div>

        </div>
    );

})

export function Comment(props){

    const commentData = props.data;
    const leftMargin = 52 * (commentData.step ? commentData.step : 0);
    const comment = commentData.comment;
    const [showReply, setShowReply] = useState(false);
    const {authenticated} = useContext(authenticatedContext);
    const firstName = comment.authorName.split(" ")[0];
    const refreshComments = props.refreshComments;

    function changeReply(event){
        if(!authenticated){
            console.error("Uesr Not Authenticated");
            return;
        }
        setShowReply(!showReply)
    }

    return (
        <div className="comment-root-container">
            <div className="comment-container" style={{marginLeft: leftMargin}}>
                <img src={`https://ui-avatars.com/api/name=${firstName}&background=random&rounded=true&size=48`}/>
                <div className="comment-body">
                    <div className="comment-heading-container">
                        <p className="comment-heading">{comment.authorName}</p> 
                        {comment.parentAuthorName ? 
                        <ReplyIcon className="reply-icon"/>
                        : null}
                        {comment.parentAuthorName ? 
                        <p className="comment-heading" style={{color: "gray"}}> {comment.parentAuthorName}</p> 
                        : null}
                    </div>
                    <p>{comment.text}</p>
                    <p className="reply-text" onClick={changeReply}>Reply</p>
                </div>
            </div>
            {
                authenticated && showReply ? <PostComment step={commentData.step} comment={comment} setShowReply={setShowReply} refreshComments={refreshComments}/> : null
            }
        </div>
        
    );
}

export function PostComment(props){

    const [text, setText] = useState("");
    const {authenticated, setAuthenticated, user} = useContext(authenticatedContext);
    const comment = props.comment;
    const leftMargin = 52 * (props.step ? props.step : 1);
    const setShowReply = props.setShowReply;
    const refreshComments = props.refreshComments;

    let firstName = "";

    if(Object.keys(user).length > 0){
        firstName = user.name.split(" ")[0];
    }else{
        firstName = "User";
    }


    function postReply(event){

        if(text.length > 0){
            Axios({
                method: "POST",
                withCredentials: true,
                data: {
                    text: text,
                    parentAuthorName: comment.authorName,
                    parentCommentId: comment._id
                },
                url: "/api/comments/reply"
            }).then((res) => {
                if(!res.data.errors && typeof res.data.result !== 'undefined'){
                    setShowReply(false);
                    refreshComments();
                }else{
                    console.error("There was an erro trying to post the reply!");
                }
            }).catch(err => {
                console.error(err);
            });
        }else {
            console.error("Reply should not be empty!");
        }
  
    };

    return (
        <div className="post-comment-container" style={{marginLeft: String(leftMargin) + "px"}}>
            <img src={`https://ui-avatars.com/api/name=${firstName}&background=random&rounded=true&size=48`}/>
            <input className="comment-input" type="text" placeholder="Type your comment here!" value={text} onChange={(event) => {setText(event.target.value)}}/>
            <button className="comments-post-button" onClick={postReply} >Post</button>
            <button className="comments-cancel-button" onClick={() => {setShowReply(false)}} >Cancel</button>

        </div>
    );
}

export function Tag(props){

    const navigate = useNavigate();

    function searchByTags() {
        navigate("/explore/1/tags/" + props.tagContent);
    }

    return (
        <div className="tag-container" onClick={searchByTags}>
            <span className="tag-contert">{ props.tagContent ? props.tagContent :  "tag"}</span>
        </div>
    )
}

export default Post;
