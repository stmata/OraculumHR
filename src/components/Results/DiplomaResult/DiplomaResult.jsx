import React, { useContext, useEffect, useState } from "react";
import styles from "./DiplomaResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";

const DiplomaResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    searchTerm,
    uploadedFiles,
    setExtractedData,
    docType,
    lang,
  } = useSession();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const t = translations[lang];

  const {
    fullname,
    institution,
    field_of_study,
    degree,
    graduation_date,
    diploma_number,
    _sourceFileIndex,
  } = data;

  const id = `${fullname}__${institution}_${field_of_study}_${degree}`;

  const [editMode, setEditMode] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [formData, setFormData] = useState(data);
  const [fileUrl, setFileUrl] = useState(null);

  const sourceFile = uploadedFiles?.[_sourceFileIndex] || null;

  useEffect(() => {
    if (!sourceFile) {
      setFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(sourceFile);
    setFileUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sourceFile]);

  // const getCountryInfo = (c) => {
  //   const lower = c?.trim().toLowerCase();
  //   return countryData.find(
  //     (x) =>
  //       x.name.toLowerCase() === lower ||
  //       x.isoAlpha3?.toLowerCase() === lower ||
  //       (Array.isArray(x.aliases) &&
  //         x.aliases.some((alias) => alias.toLowerCase() === lower))
  //   );
  // };
  // const countryInfo = getCountryInfo(country);

  const withFallback = (value) => {
    const raw = value?.toString().trim();
    if (!raw || raw.toLowerCase() === "not provided") return t.notProvided;
    return value;
  };

  if (docType !== "diploma") return null;

  const isSelected = filterMode === "All" || selectedCards.includes(id);

  const toggleSelect = () => {
    const already = selectedCards.includes(id);

    if (filterMode === "Manually") {
      setSelectedCards((prev) =>
        already ? prev.filter((x) => x !== id) : [...new Set([...prev, id])]
      );
      return;
    }
    if (already) return;

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
      if (matches) {
        setSelectedCards((prev) => [...prev, id]);
      }
      return;
    }
    // if (filterMode === "Country") {
    //   const sel = selectedCountry?.toLowerCase();
    //   const itemC = country?.toLowerCase();
    //   const match = sel === "anywhere" || itemC === sel;
    //   if (match) {
    //     setSelectedCards((prev) => [...prev, id]);
    //   }
    // }
  };

  // useEffect(() => {
  //   if (!countryInfo) return;
  //   setDetectedCountries((prev) => {
  //     const exists = prev.some((c) => c.name === countryInfo.name);
  //     return exists
  //       ? prev
  //       : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
  //   });
  // }, [countryInfo, setDetectedCountries]);

  useEffect(() => {
    if (filterMode === "All" && !selectedCards.includes(id)) {
      setSelectedCards((prev) => [...prev, id]);
    }
  }, [filterMode, id, selectedCards, setSelectedCards]);

  const handleDoubleClick = () => {
    setEditMode(true);
    setFormData(data);
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setEditMode(false);
    setExtractedData((prev) =>
      prev.map((d) =>
        d.fullname + "__" + d.graduation_date === id ? { ...formData } : d
      )
    );
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData(data);
  };

  const toggleShowFile = (e) => {
    e.stopPropagation();
    setShowFile((prev) => !prev);
  };
  const isFieldMissing = () => {
    const source = editMode ? formData : data;

    const checks = [
      source.fullname,
      source.institution,
      source.field_of_study,
      source.degree,
      source.graduation_date,
      source.diploma_number,
      source.country,
      source.city,
    ];

    return checks.some((val) => {
      if (!val) return true;
      const raw = val.toString().trim().toLowerCase();
      return raw === "" || raw === "not provided" || raw === "double check";
    });
  };

  const hasWarning = isFieldMissing();
  return (
    <div className={styles.resultWrapper}>
      <div
        className={`
          ${styles.card}
          ${isDark ? styles.darkCard : ""}
          ${isSelected ? styles.selected : ""}
        `}
        tabIndex={0}
        onClick={() => {
          if (!editMode) toggleSelect();
        }}
        onDoubleClick={handleDoubleClick}
      >
        {hasWarning && (
          <div className={styles.customToastWarning}>
            <div className={styles.toastIcon}>⚠️</div>
            <div className={styles.toastText}>
              {t.incompleteFieldsWarning}
            </div>
          </div>
        )}
        <div className={styles.contentRow}>
          {/* <div className={styles.left}>
            <div className={styles.flag}>{countryInfo?.flag || "🎓"}</div>

            {editMode ? (
              <>  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.country} :</div>

                <input
                  type="text"
                  className={`${styles.editInputPays} ${isDark ? styles.darkEditInputPays : ""
                    }`}
                  value={formData.country}
                  onChange={handleChange("country")}
                />
              </>
            ) : (
              <div className={styles.country}>
                {withFallback(countryInfo?.name || country)} —{" "}
                {withFallback(city)}
              </div>
            )}
          </div> */}
          <div className={styles.middle}>
            <div className={styles.nameRow}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.name} :</div>

                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""
                      }`}
                    value={formData.fullname}
                    onChange={handleChange("fullname")}
                  />
                </div>
              ) : (
                <div className={styles.name}>{withFallback(fullname)}</div>
              )}
            </div>
            <div className={styles.meta}>
              {editMode ? (

                <>
                  <div className={styles.nameRow}>
                    <div className={styles.inputGroup}>
                      <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.degree} :</div>
                      <input
                        type="text"
                        className={`${styles.editInputMeta} ${isDark ? styles.darkeditInputMeta : ""
                          }`}
                        value={formData.degree}
                        onChange={handleChange("degree")}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.major} :</div>
                      <input
                        type="text"
                        className={`${styles.editInputMeta} ${isDark ? styles.darkeditInputMeta : ""
                          }`}
                        value={formData.field_of_study}
                        onChange={handleChange("field_of_study")}
                      />
                    </div>
                  </div>
                </>
              ) : (
                `${withFallback(degree)} — ${withFallback(field_of_study)}`
              )}
            </div>
            <div className={styles.meta}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.university} :</div>

                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""
                      }`}
                    value={formData.institution}
                    onChange={handleChange("institution")}
                  />
                </div>
              ) : (
                withFallback(institution)
              )}
            </div>
          </div>
          <div className={styles.right}>
            <div>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.date_obtention} :</div>

                  <input
                    type="text"
                    className={`${styles.editInputDate} ${isDark ? styles.darkEditInputDate : ""} ${editMode ? styles.editModeDate : ""}`}

                    value={formData.graduation_date}
                    onChange={handleChange("graduation_date")}
                  />
                </div>
              ) : (
                withFallback(graduation_date)
              )}
            </div>
            <div>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""} `}>{t.diploma_number} :</div>

                  <input
                    type="text"
                    className={`${styles.editInputLang} ${isDark ? styles.darkEditInputLang : ""
                      } ${editMode ? styles.editModeDate : ""}`}
                    value={formData.diploma_number}
                    onChange={handleChange("diploma_number")}
                  />
                </div>
              ) : (
                withFallback(diploma_number)
              )}
            </div>

            {sourceFile && (
              <button className={styles.moreBtn} onClick={toggleShowFile}>
                📄
              </button>
            )}
          </div>
        </div>

        {editMode && (
          <div className={styles.actionButtons}>
            <button
              onClick={handleSave}
              className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""
                }`}
            >
              {t.save || "Save"}
            </button>
            <button
              onClick={handleCancel}
              className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""
                }`}
            >
              {t.cancel || "Cancel"}
            </button>
          </div>
        )}
      </div>

      {showFile && sourceFile && (
        <div className={styles.filePreview}>
          {sourceFile.type.includes("pdf") ? (
            <iframe src={fileUrl} width="100%" height="100%" />
          ) : sourceFile.type.includes("image") ? (
            <img src={fileUrl} alt="Preview" />
          ) : (
            <p style={{ color: "red", fontWeight: "bold" }}>
              {t.unsupportedFormat} <strong>{sourceFile.name}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DiplomaResult;
