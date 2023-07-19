import { 
    Grid, 
    Dropdown
} from "@nextui-org/react";

import { 
    useState, 
    useContext 
} from "react";

import i18n from "./../i18n";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { AppContext } from "./../Contexts/AppContext";
import { TranslateIcon } from "./../Components/Icons/TranslateIcon"

export default function SwitchLocale(props) {
  const { t } = useTranslation();

  const { settings } = useContext(AppContext);

  const [action, setAction] = useState(
    i18n.language
  );

  const handleAction = (actionKey) => {
    setAction(actionKey);
    i18n.changeLanguage(actionKey);
  };

  return (
    <Grid aria-labelledby="switch-locale">
      <Dropdown {...props}>
        <Dropdown.Button 
          flat 
          icon={<TranslateIcon></TranslateIcon>}
        >
        </Dropdown.Button>
        <Dropdown.Menu
          onAction={handleAction}
          aria-label={t('Change Locale')}
        >
          {Object.entries(settings.translations.all).map(
            ([key,value]) => {
                return (
                    <Dropdown.Item 
                      key={key}
                      icon={
                        <ReactCountryFlag 
                          svg
                          cdnSuffix="svg"
                          style={{
                            width: '2em',
                            height: '2em',
                          }}
                          title={t(value.title)} 
                          countryCode={value.countryCode}
                          cdnUrl={process.env.PUBLIC_URL+'/assets/img/flags/1x1/'}
                        />
                      }
                      command={t(key).toUpperCase()}
                      >
                      {t(value.title)}
                    </Dropdown.Item>
                );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </Grid>
  );
}
