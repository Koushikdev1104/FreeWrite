import React from "react";
import { Outlet } from "react-router-dom";

function TopBar(props){

    return (
        <div>
        <div style={{margin: "0 20rem", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h1 style={{cursor: "pointer"}}>Home</h1>
            <span style={{fontSize: "1.2rem", cursor: "pointer"}}>{props.name}</span>
        </div>
        <Outlet />
        </div>
        
    )
}

export default TopBar;