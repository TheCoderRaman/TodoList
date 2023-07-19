import i18n from "i18next";
import resources from "./Data/translations";
import { localDB } from "./Modules/localDb";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

let locale = ((!localDB("local", "settings").hasRecord("locale"))
  ? "en" : localDB("local", "settings").getRecord("locale")
);

i18n.use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: locale.toString(),
    fallbackLng: "hi",
    interpolation: {
      escapeValue: false
    },
});

document.documentElement.setAttribute("lang", locale.toString());
localDB("local", "settings").setRecord("locale", locale.toString());

i18n.on("languageChanged", (lng) => {
  document.documentElement.setAttribute("lang", lng);
  localDB("local", "settings").setRecord("locale", lng);
});

export default i18n;
