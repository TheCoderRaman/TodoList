import { 
  useState,
  useEffect, 
  createContext
} from "react";

import { 
  changeTheme,
  NextUIProvider
} from "@nextui-org/react";

import { localDB } from "./../Modules/localDb";
import { darkTheme } from "./../Themes/darkTheme";
import { lightTheme } from "./../Themes/lightTheme";

export const themes = {
  dark: darkTheme,
  light: lightTheme
};

const defaultTheme = "light";
const ThemeContext = createContext({
  theme: defaultTheme, changeThemeHandler: () => {},
});

export function ThemeContextProvider(props) 
{
  
  const settingDb = localDB("local", "settings");
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    let theme = defaultTheme;

    if (settingDb.hasRecord("theme")) {
      theme = settingDb.getRecord("theme");
    }

    setTheme(theme);
    settingDb.setRecord("theme", theme);
    document.querySelector("body").classList.add(theme);
  });

  const changeThemeHandler = (theme) => {
    const oldTheme = settingDb.getRecord("theme");

    if (theme == oldTheme) {
      return;
    }

    setTheme(theme);
    document.querySelector("body").classList.toggle(theme);
    settingDb.setRecord("theme",theme);
  }

  useEffect(() => {changeTheme(theme)},[theme]);

  return (
    <NextUIProvider theme={themes[theme]}>
      <ThemeContext.Provider value={{ 
        theme: theme, changeThemeHandler: changeThemeHandler 
      }}>
        {props.children}
      </ThemeContext.Provider>
    </NextUIProvider>
  );
}

export default ThemeContext;
