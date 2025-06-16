import React, { useContext, useEffect, useState } from "react";
import styles from "./BankResult.module.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSession } from "../../../context/SessionContext";
import { translations } from "../../../constants/translations";
import { countryData } from "../../../constants/countryFlags";
import { Alert, AlertTitle } from '@mui/material';

const BankResult = ({ data }) => {
  const {
    selectedCards,
    setSelectedCards,
    filterMode,
    setDetectedCountries,
    uploadedFiles,
    setExtractedData,
    docType,
    lang,
  } = useSession();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const t = translations[lang];

  const {
    libellé_du_compte,
    code_pays,
    code_iban,
    code_bic,
    nom_banque,
    guichet_banque,
    _sourceFileIndex,
  } = data;
  const cleanIban = (code_iban || "").replace(/\s+/g, "");
  const cleanBic = (code_bic || "").replace(/\s+/g, "");
  const id = `${cleanIban}${cleanBic}`;
  const sourceFile = uploadedFiles?.[_sourceFileIndex] || null;
  const [fileUrl, setFileUrl] = useState(null);
  const [showFile, setShowFile] = useState(false);

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

  const getCountryInfo = (code) => {
    const match = countryData.find(
      (c) => c.isoAlpha2?.toLowerCase() === code?.toLowerCase()
    );
    return match || { name: code || "Unknown", flag: "🏳️" };
  };
  const countryInfo = getCountryInfo(code_pays);

  const withFallback = (value) => {
    const raw = value?.toString().trim();
    if (!raw || raw.toLowerCase() === "not provided") return t.notProvided;
    return value;
  };

  const isSelected = filterMode === "All" || selectedCards.includes(id);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    if (!countryInfo?.name) return;
    setDetectedCountries((prev) => {
      const exists = prev.some((c) => c.name === countryInfo.name);
      return exists
        ? prev
        : [...prev, { name: countryInfo.name, flag: countryInfo.flag }];
    });
  }, [countryInfo, setDetectedCountries]);

  useEffect(() => {
    if (filterMode === "All" && !selectedCards.includes(id)) {
      setSelectedCards((prev) => [...prev, id]);
    }
  }, [filterMode, id, selectedCards, setSelectedCards]);

  if (docType !== "bank") return null;

  const toggleSelect = () => {
    const alreadySelected = selectedCards.includes(id);
    setSelectedCards((prev) =>
      alreadySelected ? prev.filter((el) => el !== id) : [...new Set([...prev, id])]
    );
  };

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
      prev.map((d) => {
        const currentId =
          (d.code_iban || "").replace(/\s+/g, "") +
          (d.code_bic || "").replace(/\s+/g, "");
        return currentId === id ? { ...formData } : d;
      })
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
      source.libellé_du_compte,
      source.code_pays,
      source.code_iban,
      source.code_bic,
      source.nom_banque,
      source.guichet_banque
    ];

    return checks.some((val) => {
      if (!val) return true;
      const raw = val.toString().trim().toLowerCase();
      return raw === "" || raw === "not provided" || raw === "double check";
    });
  };

  const hasWarning = isFieldMissing();

  return (
    <div className={`${styles.cardWrapper}`}>

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
          <div className={styles.left}>
            <div className={styles.flag}>{countryInfo.flag}</div>
            {editMode ? (
              <>  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.country} :</div>

                <input
                  type="text"
                  className={`${styles.editInputPays} ${isDark ? styles.darkEditInputPays : ""}`}
                  value={formData.code_pays}
                  onChange={handleChange("code_pays")}
                />
              </>
            ) : (
              <div className={styles.country}>
                {withFallback(countryInfo.name)}
              </div>
            )}
          </div>
          <div className={styles.middle}>
            <div className={styles.nameRow}>

              {editMode ? (
                <>  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.name} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputFN : ""}`}
                    value={formData.libellé_du_compte}
                    onChange={handleChange("libellé_du_compte")}
                  />
                </>
              ) : (
                <div className={styles.name}>
                  {withFallback(libellé_du_compte)}
                </div>
              )}


            <div className={styles.value}>
              {editMode ? (
                <>  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>IBAN :</div>
                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputMeta : ""}`}
                    value={formData.code_iban}
                    onChange={handleChange("code_iban")}
                  />
                </>
              ) : (
                <span className={styles.iban}>{withFallback(code_iban)}</span>
              )}
            </div>



            <div className={styles.value}>
              {editMode ? (
                <>  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>BIC :</div>

                  <input
                    type="text"
                    className={`${styles.editInputFN} ${isDark ? styles.darkeditInputMeta : ""}`}
                    value={formData.code_bic}
                    onChange={handleChange("code_bic")}
                  />
                </>
              ) : (
                <span className={styles.iban}>{withFallback(code_bic)}</span>
              )}
            </div>
            </div>

          </div>
          <div className={styles.right}>
            <div className={styles.meta}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.bankName} :</div>
                  <input
                    type="text"
                    className={`${styles.editInputGuichet} ${isDark ? styles.darkEditInputGuichet : ""}`}
                    value={formData.nom_banque}
                    onChange={handleChange("nom_banque")}
                  />
                </div>
              ) : (
                withFallback(nom_banque)
              )}
            </div>
            <div className={styles.meta}>
              {editMode ? (
                <div className={styles.inputGroup}>
                  <div className={`${styles.editLabel} ${isDark ? styles.darkeditLabel : ""}`}>{t.bankBranch} :</div>

                 <textarea
  className={`${styles.editInputGuichet} ${isDark ? styles.darkEditInputGuichet : ""}`}
  value={formData.guichet_banque}
  onChange={handleChange("guichet_banque")}
  rows={5}
/>

                </div>
              ) : (
                withFallback(guichet_banque)
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
              className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}
            >
              {t.save || "Save"}
            </button>
            <button
              onClick={handleCancel}
              className={`${styles.saveButton} ${isDark ? styles.darkSaveButton : ""}`}
            >
              {t.cancel || "Cancel"}
            </button>
          </div>
        )}
      </div>
      {showFile && sourceFile && (
        <div className={
          sourceFile.type.includes("image")
            ? styles.imagePreview
            : styles.filePreview
        }>
          {sourceFile.type.includes("pdf") ? (
            <iframe src={fileUrl} />
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

export default BankResult;
