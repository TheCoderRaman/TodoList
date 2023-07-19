import { 
    useEffect, 
    useContext 
} from "react";

import { route } from "./../Utils/route";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./../Contexts/AuthContext";

export default function Home() {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if(authContext.authUser.current === null){
            navigate(route('signIn'));
        } else {
            navigate(route('todoList'));
        }
    });
};