import { ReactNode } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react'

const PrivateRoute: React.FC<{children: ReactNode}> = ({ children }) => {

    const { keycloak } = useKeycloak(); 
    const isLoggedIn = keycloak.authenticated;
    
    const navigate = useNavigate();
    
    useEffect(() => {
        if (isLoggedIn == false) {
            navigate("/");
        }
    }, [isLoggedIn]);

    return children
};

export default PrivateRoute;
