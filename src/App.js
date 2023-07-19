import React, { 
  useState,
  useEffect
} from "react";

import "./index.css";
import { Helmet } from "react-helmet";
import { routeName } from "./Utils/route";
import { settings } from "./Data/settings";
import { Router } from "./Components/Router";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppContextProvider from "./Contexts/AppContext";
import { ThemeContextProvider } from "./Contexts/ThemeContext";

export const App = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [route,setRoute] = useState(t('Home'));

  useEffect(() => {
    setRoute(routeName(location?.pathname ?? route("Home")));
  }, [location])
  
  return (
    <AppContextProvider>
      <ThemeContextProvider>
        <Helmet>
          <title>{t(settings.app.name)+" | "+t(route)}</title>
          <meta name="description" content={t(settings.app.summary)} />
        </Helmet>
        <Router />
      </ThemeContextProvider>
    </AppContextProvider>
  );
};
