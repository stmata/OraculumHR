import React, { useContext, useEffect } from "react";
import styles from "./PassportResult.module.css";
import { countryData } from "../../../constants/countryFlags";
import { useSession } from "../../../context/SessionContext";
import { ThemeContext } from "../../../context/ThemeContext";
import { translations } from "../../../constants/translations";

const PassportResult = ({ data }) => {
    const {
        selectedCards,
        setSelectedCards,
        filterMode,
        searchTerm,
        selectedCountry,
        setDetectedCountries
    } = useSession();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const { lang } = useSession();
    const t = translations[lang];

    const {
        country,
        firstname,
        surname,
        passport_number,
        passport_type,
        date_of_birth,
        expiry_date,
        place_of_birth,
        city
    } = data;

    const id = passport_number;
    const isSelected = filterMode === "All" || selectedCards.includes(id);

    const withFallback = (value) => {
        const raw = value?.trim().toLowerCase();
        if (!raw || raw === "not provided" || raw === "non fourni") {
            return t.notProvided;
        }
        return value;
    };

    const toggleSelect = () => {
        const alreadySelected = selectedCards.includes(id);

        if (filterMode === "Manually") {
            setSelectedCards((prev) => {
                return alreadySelected
                    ? prev.filter((el) => el !== id)
                    : [...new Set([...prev, id])];
            });
            return;
        }

        if (alreadySelected) return;

        if (filterMode === "All") {
            setSelectedCards((prev) => [...prev, id]);
            return;
        }

        if (filterMode === "Search") {
            const term = searchTerm?.trim().toLowerCase();
            if (!term) return;
            const matches = Object.values(data).some(
                (val) =>
                    typeof val === "string" && val.toLowerCase().includes(term)
            );
            if (matches) {
                setSelectedCards((prev) => [...prev, id]);
            }
            return;
        }

        if (filterMode === "Country") {
            const selected = selectedCountry?.toLowerCase();
            const itemCountry = country?.toLowerCase();
            const match = selected === "anywhere" || itemCountry === selected;

            if (match) {
                setSelectedCards((prev) => [...prev, id]);
            }
        }
    };

    const getCountryInfo = (country) => {
        const lowerCountry = country?.toLowerCase();
        return countryData.find(
            (c) =>
                c.name.toLowerCase() === lowerCountry ||
                c.isoAlpha3?.toLowerCase() === lowerCountry ||
                (Array.isArray(c.aliases) &&
                    c.aliases.some((alias) => alias.toLowerCase() === lowerCountry))
        );
    };

    const countryInfo = getCountryInfo(country);

    useEffect(() => {
        if (!countryInfo) return;
        setDetectedCountries((prev) => {
            const exists = prev.some((c) => c.name === countryInfo.name);
            return exists ? prev : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
        });
    }, [countryInfo, setDetectedCountries]);

    return (
        <div
            className={`${styles.card} ${isDark ? styles.darkCard : ""} ${isSelected ? styles.selected : ""}`}
            tabIndex={0}
            onClick={toggleSelect}
        >
            <div className={styles.left}>
                <div className={styles.flag}>{countryInfo?.flag || "🏳️"}</div>
                <div className={styles.country}>{withFallback(countryInfo?.name || country)}</div>
            </div>

            <div className={styles.middle}>
                <div className={styles.nameRow}>
                    <div className={styles.name}>
                        {withFallback(firstname)} {withFallback(surname)}
                        <div className={styles.greenBadge}>{withFallback(passport_type)}</div>

                        <span className={`${styles.idNumber} ${styles.idNumber}`}>
                            {withFallback(passport_number)}
                        </span>

                    </div>
                </div>
                <div className={styles.meta}>
                    {withFallback(city)} — {withFallback(expiry_date)}
                </div>
            </div>

            <div className={styles.right}>
                <div>{withFallback(date_of_birth)}</div>
                <div>{withFallback(place_of_birth)}</div>
            </div>
        </div>
    );
};

export default PassportResult;
