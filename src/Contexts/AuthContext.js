import React, { 
  useRef, 
  createContext 
} from "react";

import { route } from "./../Utils/route";
import { localDB } from "./../Modules/localDb";

export const AuthContext = createContext({
  authUser: null, authenticate: () => {}
});

export default function AuthContextProvider(props){
  const authUser = useRef(null);

  const userDb = localDB("local", "users");
  const sessionDb = localDB("local", "sessions");
  
  const authenticate = (redirect = true) => {
    let user_id = sessionDb.getRecord(
        "session_id"
    );
    
    if(user_id === null){
        user_id = authUser.current?.user_id ?? null;
    }
    
    if (user_id === null) {
      return !redirect ? null : route('home');
    }

    let user = userDb.getRecord(user_id);
    
    if (user === null) {
      return !redirect ? null : route('home');
    }

    authUser.current = user; return null;
  };

  return (
    <AuthContext.Provider value={{
      authUser, authenticate
    }}>
      {props.children}
    </AuthContext.Provider>
  );
};