import { cookies } from "next/headers";
import { getDefaultLocale, supportedLocales, type Locale, getTranslations as getTranslationsBase } from "./i18n";

export async function getRequestLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("locale")?.value?.toLowerCase();
    if (cookieLocale && supportedLocales.includes(cookieLocale as Locale)) {
        return cookieLocale as Locale;
    }
    return getDefaultLocale();
}

export async function getTranslations(locale?: Locale) {
    const loc = locale || await getRequestLocale();
    const base = getTranslationsBase(loc);
    return {
        ...base,
        locale: loc,
    };
}
