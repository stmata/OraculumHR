import React, { useContext, useEffect } from "react";
import styles from "./DownloadFormatSelect.module.css";
import { BsDownload } from "react-icons/bs";
import { ThemeContext } from "../../context/ThemeContext";
import { useSession } from "../../context/SessionContext";
import CustomSelect from '../FilterBar/CustomSelect'
import { translations } from "../../constants/translations";
import { exportDataAs } from "../../utils/exportUtils";

const DownloadFormatSelect = ({ value, onChange, className = "" }) => {
    const { theme } = useContext(ThemeContext);
    const { lang, selectedCards, extractedData } = useSession();
    const isDark = theme === "dark";
    console.log('hihi')
    console.log(selectedCards);

    const t = translations[lang];

    const {
        filterMode,
        setFilterMode,
    } = useSession();

    const filterOptions = [
        { label: `✅ ${t.all}`, value: "All" },
        { label: `✋ ${t.manually}`, value: "Manually" },
    ];
    const formats = [
        { label: "JSON", value: "json" },
        { label: "Excel", value: "xls" },
        { label: "CSV", value: "csv" }
    ]; const isDisabled = selectedCards.length === 0;

    useEffect(() => {
        if (!value && selectedCards.length > 0) {
            onChange("csv");
        }
    }, [value, selectedCards, onChange]);

    const handleExport = (format) => {

        if (isDisabled) return;

        const uniqueMap = new Map();

        extractedData.forEach((item) => {
            const exportId = item.full_name && item.date
                ? `${item.full_name}${item.date}`
                : null;
            const cleanIban = (item.code_iban || "").replace(/\s+/g, "");
            const cleanBic = (item.code_bic || "").replace(/\s+/g, "");
            const bankId = cleanIban && cleanBic ? `${cleanIban}${cleanBic}` : null;


            const id =
                item.id_number ||
                item.passport_number ||
                item.email ||
                item.document_id ||
                bankId ||
                exportId || null;
            if (id && selectedCards.includes(id) && !uniqueMap.has(id)) {
                uniqueMap.set(id, item);
            }
        });

        const filtered = Array.from(uniqueMap.values());

        exportDataAs(format, filtered);
    };

    return (<div className={styles.all}>
        <div className={`${styles.formatButtonGroup} ${isDark ? styles.dark : ""} ${className}`}>
            {formats.map(({ label, value }) => (
                <button
                    key={value}
                    className={`
            ${styles.formatButton}
            ${isDark ? styles.darkButton : ""}
            ${isDisabled ? styles.disabled : ""}
          `}
                    onClick={() => {
                        if (!isDisabled) handleExport(value);
                    }}
                    disabled={isDisabled}
                >
                    <BsDownload className={styles.icon} />
                    {label}
                </button>

            ))}
        </div>
        <CustomSelect
            options={filterOptions}
            value={filterOptions.find((opt) => opt.value === filterMode)}
            onChange={(selected) => setFilterMode(selected.value)}
            getOptionLabel={(option) => option.label}
            icon="📂"

        />

    </div>

    );
};

export default DownloadFormatSelect;
