import React, { useEffect, useState } from "react";
import {  Route, Routes } from 'react-router-dom';
import SignInForm from './pages/signIn';
import SignUpForm from './pages/signUp';
import HomePage, { TopNav } from "./pages/home";
import Post from "./pages/postPage";
import ProfilePage, {EditProfilePage} from "./pages/profile";
import authenticatedContext from "./context/authenticated-context";
import Axios from "axios";
import CreatePost, { EditPost } from "./pages/createPost";
import Redirect from "./components/Redirect";
import ExplorePosts from "./pages/explore";
import MyPosts from "./pages/myPosts";
import Nothing from "./components/Nothing";
import { ToastProvider } from "react-toast-notifications";
import Loader from "./components/Loader";

function App() {

  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const value = {authenticated, setAuthenticated, user, setUser};


  useEffect( ()=>{

    Axios({
      method: "GET",
      withCredentials: true,
      url: "/api/users/user"
      }).then((res) => {
        if(!!res.data.authenticated){
            setAuthenticated(res.data.authenticated);
            setUser(res.data.user);
        }
      }).catch((e) => {
        console.error(e);
      });

  }, []);

  return (

    <authenticatedContext.Provider value={value}>

      <ToastProvider placement="bottom-right">
      {/* <BrowserRouter> */}
        <Routes>
            <Route path="/" element={<TopNav />} >
              <Route path="" element={<Redirect path="/home" />} />
              <Route path="home" element={<HomePage />} />
              <Route path="my-posts" element={<MyPosts />} />                               {/* authentiation required */}
              <Route path="explore/:page/" element={<ExplorePosts />} />
              <Route path="explore/:page/tags/:tag/" element={<ExplorePosts tags="true"/>} />
              <Route path="explore" element = {<Redirect path="/explore/1" />} />
              <Route path="signup" element={<SignUpForm />}/>
              <Route path="login" element={<SignInForm />}/>
              <Route path="posts/:postId" element={<Post />}/>
              <Route path="profile/" >
                <Route path="" element={<ProfilePage />} />                                 {/* authentiation required */}
                <Route path="edit" element={<EditProfilePage />} />                         {/* authentiation required */}
              </Route>
              <Route path="posts/create-post" element={<CreatePost />} />                   {/* authentiation required */}
              <Route path="posts/edit-post/:postId" element={<EditPost />}/>                {/* authentiation required */}
              <Route path="/nothing" element={<Redirect path="/there-is-nothing-here" />} />
              <Route path="/loader" element={<Loader path="/loader" />} />
              <Route
                path="/*"
                element={
                  <Nothing />
                }
            />
          </Route>
        </Routes>
      {/* </BrowserRouter> */}

      </ToastProvider>

    </authenticatedContext.Provider>

  );
}

export default App;
