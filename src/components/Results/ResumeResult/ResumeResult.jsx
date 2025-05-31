import React, { useContext, useEffect, useState } from "react";
import styles from "./ResumeResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";
import { BsThreeDotsVertical } from "react-icons/bs";

const ResumeResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    searchTerm,
    selectedCountry,
    lang
  } = useSession();

  const { theme } = useContext(ThemeContext);
  const [localTheme, setLocalTheme] = useState(theme);
  const isDark = localTheme === "dark";

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const t = translations[lang];

  const {
    firstname,
    lastname,
    address,
    phone,
    email,
    experience,
    education,
    skills,
    languages,
  } = data;

  const [showDetails, setShowDetails] = useState(false);

  const id = email;
  const isSelected = filterMode === "All" || selectedCards.includes(id);

  const toggleSelect = () => {
    const alreadySelected = selectedCards.includes(id);

    if (filterMode === "Manually") {
      setSelectedCards((prev) =>
        alreadySelected ? prev.filter((el) => el !== id) : [...new Set([...prev, id])]
      );
      return;
    }

    if (alreadySelected) return;

    if (filterMode === "All") setSelectedCards((prev) => [...prev, id]);
    console.log(selectedCards);
    if (filterMode === "Search") {
      const term = searchTerm?.trim().toLowerCase();
      if (!term) return;
      const matches = Object.values(data).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(term)
      );
      if (matches) setSelectedCards((prev) => [...prev, id]);
    }

    if (filterMode === "Country") {
      const selected = selectedCountry?.toLowerCase();
      const itemCountry = "canada";
      const match = selected === "anywhere" || itemCountry === selected;
      if (match) setSelectedCards((prev) => [...prev, id]);
    }
  };

  const withFallback = (value) => {
    const raw = value?.trim();
    if (!raw || raw.toLowerCase() === "not provided") return t.notProvided;
    return value;
  };

  const experienceLines = withFallback(experience).split("\n").filter((line) => line.trim());
  const firstExperience = experienceLines[0];
  const remainingExperience = experienceLines.slice(1);

  const langList = withFallback(languages).split(",").map((l) => l.trim()).filter((l) => l);
  const displayedLangs = langList.slice(0, 3);
  const remainingLangs = langList.length > 3 ? langList.slice(3) : [];
  const remainingCount = langList.length > 3 ? langList.length - 3 : 0;
  useEffect(() => {
    if (filterMode === "All" && !selectedCards.includes(id)) {
      setSelectedCards((prev) => [...prev, id]);
    }
  }, [filterMode, id, selectedCards, setSelectedCards]);

  return (
    <>
      <div
        className={`${styles.card} ${isDark ? styles.darkCard : ""} ${isSelected ? styles.selected : ""} ${showDetails ? styles.cardOpen : styles.cardClosed}`}
        tabIndex={0}
        onClick={toggleSelect}
      >
        <div className={styles.left}>
          <div className={styles.fullName}>{withFallback(firstname)} {withFallback(lastname)}</div>
          <div className={styles.infoRow}><span className={styles.emoji}>✉️</span>{withFallback(email)}</div>
          <div className={styles.infoRow}><span className={styles.emoji}>📞</span>{withFallback(phone)}</div>
          <div className={styles.infoRow}><span className={styles.emoji}>📍</span>{withFallback(address)}</div>
        </div>

        <div className={styles.rightt}>
          <div className={styles.topRightWrapper}>
            <button className={styles.moreBtn} onClick={(e) => { e.stopPropagation(); setShowDetails((prev) => !prev); }}>
              <BsThreeDotsVertical />
            </button>
          </div>

          <div className={styles.experience}>{withFallback(firstExperience)}</div>

          <div className={styles.languages}>
            {displayedLangs.map((lang, i) => (
              <span key={i} className={`${styles.langBadge} ${isDark ? styles.darkLangBadge : ""}`}>{lang}</span>
            ))}
            {remainingCount > 0 && (
              <span className={`${styles.langExtra} ${isDark ? styles.darkLangExtra : ""}`}>+{remainingCount}</span>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className={`${styles.detailsBox} ${isDark ? styles.darkDetailsBox : ""}`}>
          <div className={styles.detailSection}>
            <div className={styles.detailTitleGreen}>{t.skills || "Skills"}</div>
            <div className={styles.details}>{withFallback(skills)}</div>
          </div>

          {remainingExperience.length > 0 && (
            <div className={styles.detailSection}>
              <div className={styles.detailTitleBlur}>{t.experience || "Experience"}</div>
              <div className={styles.details}>
                {remainingExperience.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.detailSection}>
            <div className={styles.detailTitleEduc}>{t.education || "Education"}</div>
            <div className={styles.details}>{withFallback(education)}</div>
          </div>

          {remainingLangs.length > 0 && (
            <div className={styles.detailSection}>
              <div className={styles.detailTitleLang}>{t.languages || "Languages"}</div>
              <div className={styles.details}>{remainingLangs.join(", ")}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ResumeResult;
