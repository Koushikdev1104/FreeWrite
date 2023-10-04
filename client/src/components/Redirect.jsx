import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Redirect(props){
    const {path} = props;
    const navigate = useNavigate();
    useEffect(
        () => {
            navigate(path);
        }
    )

    return (null);
}

export default Redirect;