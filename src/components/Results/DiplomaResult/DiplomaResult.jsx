import React, { useContext, useEffect } from "react";
import styles from "./DiplomaResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";
import { countryData } from "../../../constants/countryFlags";

const DiplomaResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    searchTerm,
    selectedCountry,
    setDetectedCountries,
    docType,
  } = useSession();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { lang } = useSession();
  const t = translations[lang];

  const {
    full_name,
    university,
    major,
    degree,
    date,
    language,
    country,
    city,
  } = data;

  const id = full_name + date; 

  const withFallback = (value) => {
    const raw = value?.trim();
    if (!raw || raw.toLowerCase() === "not provided") return t.notProvided;
    return value;
  };

  const getCountryInfo = (country) => {
    const lower = country?.toLowerCase();
    return countryData.find(
      (c) =>
        c.name.toLowerCase() === lower ||
        c.isoAlpha3?.toLowerCase() === lower ||
        (Array.isArray(c.aliases) &&
          c.aliases.some((alias) => alias.toLowerCase() === lower))
    );
  };

  const countryInfo = getCountryInfo(country);
  const isSelected = filterMode === "All" || selectedCards.includes(id);

  const toggleSelect = () => {
    const alreadySelected = selectedCards.includes(id);

    if (filterMode === "Manually") {
      setSelectedCards((prev) => {
        return alreadySelected
          ? prev.filter((id) => id !== id)
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
      (val) => typeof val === "string" && val.toLowerCase().includes(term)
    );
    if (matches && !alreadySelected) {
      setSelectedCards((prev) => [...prev, id]);
    }
    return;
  }

  if (filterMode === "Country") {
    const selected = selectedCountry?.toLowerCase();
    const itemCountry = country?.toLowerCase();
    const match = selected === "anywhere" || itemCountry === selected;
    if (match && !alreadySelected) {
      setSelectedCards((prev) => [...prev, id]);
    }
  }
};


  useEffect(() => {
    if (!countryInfo) return;
    setDetectedCountries((prev) => {
      const exists = prev.some((c) => c.name === countryInfo.name);
      return exists ? prev : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
    });
  }, [countryInfo, setDetectedCountries]);
useEffect(() => {
  if (filterMode === "All" && !selectedCards.includes(id)) {
    setSelectedCards((prev) => [...prev, id]);
  }
}, [filterMode, id, selectedCards, setSelectedCards]);
  if (docType !== "diploma") return null;

  return (
    <div
      className={`${styles.card} ${isDark ? styles.darkCard : ""} ${isSelected ? styles.selected : ""}`}
      tabIndex={0}
      onClick={toggleSelect}
    >
      <div className={styles.left}>
        <div className={styles.flag}>{countryInfo?.flag || "🎓"}</div>
        <div className={styles.country}>
          {withFallback(countryInfo?.name || country)} — {withFallback(city)}
        </div>
      </div>

      <div className={styles.middle}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{withFallback(full_name)}</div>
        </div>
        <div className={styles.meta}>
          {withFallback(degree)} — {withFallback(major)}
        </div>
        <div className={styles.meta}>{withFallback(university)}</div>
      </div>

      <div className={styles.right}>
        <div>{withFallback(date)}</div>
        <div>{withFallback(language)}</div>
      </div>
    </div>
  );
};

export default DiplomaResult;
