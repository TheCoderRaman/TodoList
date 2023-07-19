import { 
  useContext 
} from "react";

import { 
  Grid, 
  Switch 
} from "@nextui-org/react";

import { SunIcon } from "./Icons/SunIcon";
import { MoonIcon } from "./Icons/MoonIcon";
import ThemeContext from "./../Contexts/ThemeContext";

export default function SwitchTheme(props) {
  const schemes = ['light','dark'];
  const themeContext = useContext(ThemeContext);

  return (
    <Grid aria-labelledby="switch-theme">
      <Switch
        size="xl"
        iconOn={<SunIcon filled />}
        iconOff={<MoonIcon filled />}
        onChange={(e) => {
          themeContext.changeThemeHandler(
            schemes[e.target.checked ? 1: 0]
          );
        }}
        checked={Boolean(
          schemes.indexOf(themeContext.theme)
        )}
        {...props}
      />
    </Grid>
  );
}
