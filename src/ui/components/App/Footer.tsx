import { memo } from "react";
import { makeStyles, Text, LanguageSelect } from "ui/theme";
import { useTranslation } from "ui/i18n";
import { ReactComponent as GitHubSvg } from "ui/assets/svg/GitHub.svg";
import { useLang } from "ui/i18n";
import { DarkModeSwitch } from "onyxia-ui/DarkModeSwitch";
import { declareComponentKeys } from "i18nifty";

export type Props = {
    className?: string;
    packageJsonVersion: string;
    contributeUrl: string;
    tosUrl: string | undefined;
};

export const Footer = memo((props: Props) => {
    const { contributeUrl, tosUrl, packageJsonVersion, className } = props;

    const { classes, cx } = useStyles(props);

    const { t } = useTranslation({ Footer });

    const { lang, setLang } = useLang();

    const spacing = <div className={classes.spacing} />;

    return (
        <footer className={cx(classes.root, className)}>
            {spacing}
            <a
                href={contributeUrl}
                className={classes.contribute}
                target="_blank"
                rel="noreferrer"
            >
                <GitHubSvg className={classes.icon} />
                &nbsp;
                <Text typo="body 2">{t("contribute")}</Text>
            </a>
            <div className={classes.sep} />
            <Text typo="body 2">2022 - DATAFID</Text>
            {spacing}
            <Text typo="body 2">2017 - 2022 Onyxia</Text>
            <DarkModeSwitch size="extra small" className={classes.darkModeSwitch} />
        </footer>
    );
});

export const { i18n } = declareComponentKeys<
    "contribute" | "terms of service" | "change language"
>()({ Footer });

const useStyles = makeStyles<Props>({ "name": { Footer } })(theme => ({
    "root": {
        "backgroundColor": theme.colors.palette.custom.main,
        "display": "flex",
        "alignItems": "center",
        "& a:hover": {
            "textDecoration": "underline",
            "textDecorationColor": theme.colors.useCases.typography.textPrimary,
        },
    },
    "icon": {
        "fill": theme.colors.useCases.typography.textPrimary,
    },
    "contribute": {
        "display": "flex",
        "alignItems": "center",
    },
    "sep": {
        "flex": 1,
    },
    "spacing": {
        "width": theme.spacing(4),
    },
    "darkModeSwitch": {
        "padding": 0,
    },
}));
