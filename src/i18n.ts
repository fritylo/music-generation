import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationEn from "./translation/en";
import translationRu from "./translation/ru";
import translationUa from "./translation/ua";

i18n.use(LanguageDetector).use(initReactI18next).init({
    resources: {
        en: {
            translation: translationEn,
        },
        ru: {
            translation: translationRu,
        },
        ua: {
            translation: translationUa,
        },
    },
    fallbackLng: 'en',

    interpolation: {
        escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
});

export default i18n;