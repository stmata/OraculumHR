import React, { useContext, useEffect } from "react";
import styles from "./BankResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";
import { countryData } from "../../../constants/countryFlags";

const BankResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    searchTerm,
    selectedCountry,
    setDetectedCountries,
    docType
  } = useSession();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { lang } = useSession();
  const t = translations[lang];

  const {
    libellé_du_compte,
    code_pays,
    code_iban,
    code_bic,
    nom_banque,
    guichet_banque
  } = data;

const cleanIban = (code_iban || "").replace(/\s+/g, "");
  const cleanBic  = (code_bic  || "").replace(/\s+/g, "");
  const id        = cleanIban + cleanBic;
  const getCountryInfo = (code) => {
    const match = countryData.find(
      (c) => c.isoAlpha2?.toLowerCase() === code?.toLowerCase()
    );
    return match || { name: code || "Unknown", flag: "🏳️" };
  };

  const countryInfo = getCountryInfo(code_pays);

  const withFallback = (value) => {
    const raw = value?.trim();
    if (!raw || raw.toLowerCase() === "not provided") return t.notProvided;
    return value;
  };

  const isSelected = filterMode === "All" || selectedCards.includes(id);

  const toggleSelect = () => {
    const alreadySelected = selectedCards.includes(id);
    setSelectedCards((prev) =>
      alreadySelected ? prev.filter((el) => el !== id) : [...new Set([...prev, id])]
    );
  };

  useEffect(() => {
    if (!countryInfo?.name) return;
    setDetectedCountries((prev) => {
      const exists = prev.some((c) => c.name === countryInfo.name);
      return exists ? prev : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
    });
  }, [countryInfo, setDetectedCountries]);

  if (docType !== "bank") return null;

  return (
    <div
      className={`${styles.card} ${isDark ? styles.darkCard : ""} ${isSelected ? styles.selected : ""}`}
      tabIndex={0}
      onClick={toggleSelect}
    >
      <div className={styles.left}>
        <div className={styles.flag}>{countryInfo.flag}</div>
        <div className={styles.country}>{countryInfo.name}</div>
      </div>

      <div className={styles.middle}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{withFallback(libellé_du_compte)}</div>
        </div>
        <div className={styles.meta}>
          <strong>IBAN:</strong> {withFallback(code_iban)}
        </div>
        <div className={styles.meta}>
          <strong>BIC:</strong> {withFallback(code_bic)}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.meta}>{withFallback(nom_banque)}</div>
        <div className={styles.meta}>{withFallback(guichet_banque)}</div>
      </div>
    </div>
  );
};

export default BankResult;
