import React, { 
  useState, useContext, useEffect
} from "react";

import NavBar from "./../NavBar.js";
import { Box } from "./../Helpers/Box.js";
import { AuthContext } from "./../../Contexts/AuthContext";

export const Layout = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [update,setUpdate] = useState(Date.now());

  const updateHandler = () => {
    setUpdate(Date.now());
  };

  return (
    <Box key={update}
      css={{
        maxW: "100%"
      }}
    >
      {authContext.authUser.current 
        !== null && <NavBar onChange={updateHandler} />
      }

      <div style={{zIndex:0,position: 'relative'}}>
        {children}
      </div>
    </Box>
  );
};
