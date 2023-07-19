import { 
    useState, useEffect, useContext 
} from 'react';

import  { routes } from "./../Data/routes";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import AuthContextProvider ,{ AuthContext } from "./../Contexts/AuthContext";

const Authenticate = ({
    children, route = null
}) => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        if(route === null){
            return;
        }

        if(routes[route] === undefined){
            return;
        }

        const routeConfig = routes[route];
        
        let destination = authContext.authenticate(
            routeConfig?.auth ?? false
        );

        if(destination === null){
            setAuthenticated(true); 
            return;
        }

        navigate(destination);
    })
    
    return (
        (!authenticated) ?(<></>) : (<>{children}</>)
    );
}

export const Router = (props) => {
    return (
        <Routes>
            {Object.entries(routes).map(([name,data]) => { 
                return <Route
                    extact key={name}
                    path={data?.path} element={
                    (
                      <AuthContextProvider>
                        <Authenticate route={name}>
                            {data?.element}
                        </Authenticate>
                      </AuthContextProvider>
                    )}
                /> 
            })}
            {props.children}
        </Routes>
    );
};