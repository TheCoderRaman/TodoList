import React, { 
    useState, createContext
} from "react";

import { settings } from "./../Data/settings";

export const AppContext = createContext({
    settings: settings,updatedAt: Date.now(),setUpdatedAt: () => {}
});

export default function AppContextProvider({children}){
    const [updatedAt,setUpdatedAt] = useState(Date.now());
    
    return (
        <AppContext.Provider value={{settings,updatedAt,setUpdatedAt}}>
            {children}
        </AppContext.Provider>
    );
}