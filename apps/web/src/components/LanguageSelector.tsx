import { ChangeEvent } from "react";
import { Select } from "@chakra-ui/react";
import { useUserSession } from "../context/UserSession";
import { SupportedLanguages } from "../types";
import { useLocalStorage } from 'usehooks-ts';


interface SelectLanguageProps {
    value?: string;
    onChange: (value: string) => void;
}


function getLanguageName(lang: string, userLanguage: string = 'en') {
    const languageNames = new Intl.DisplayNames([userLanguage], {
        type: 'language'
    });
    return languageNames.of(lang);
}


export default function SelectLanguage({ value, onChange }: SelectLanguageProps) {

    const { user } = useUserSession();
    const [studyLanguage, setStudyLanguage] = useLocalStorage('studyLanguage', 'en');

    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        setStudyLanguage(ev.target.value as string);
        onChange(ev.target.value as string)
    }
    return (
        <Select value={value} onChange={_onChange}>
            <option value={undefined}>Select a language</option>
            {SupportedLanguages.map((lang) => {
                return <option selected={lang === studyLanguage} key={lang} value={lang}>{getLanguageName(lang, user?.language ?? 'en')}</option>
            })
            }
        </Select>
    )
}
