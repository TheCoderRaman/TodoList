import i18n from "i18next";

/**
 * All application settings be defined here.
 * 
 * @var const settings
 */
export const settings = {
    app: {
        debug: true,
        shorName: 'ToDo',
        name: 'Todo List',
        summary: 'Todo list for managing multiple tasks.'
    },
    assets: {
        avatar: (process.env.PUBLIC_URL+"/assets/img/avatar.png")
    },
    translations: {
        fallback: "hi",
        selected: i18n.language,
        all: {
          en: {
            title: "English",
            countryCode: 'US'
          },
          hi: {
            title: "हिंदी",
            countryCode: 'in'
          }
        }
    }
};