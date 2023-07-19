import { 
    useEffect, 
    useContext 
} from 'react';

import { route } from "./../Utils/route";
import { localDB } from "./../Modules/localDb";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./../Contexts/AuthContext";

export default function SignOut() 
{
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const sessionDb = localDB("local", "sessions");

    useEffect(() => {
        authContext.authUser.current = null;
        sessionDb.setRecord("session_id",null);
        
        navigate(route('home'));
    });
};