import React from "react";

const authenticatedContext = React.createContext({
    isAuthenticated: false,
    setAuthenticated: () => {},
    user: {},
    setUser: () => {}
});

export default authenticatedContext;