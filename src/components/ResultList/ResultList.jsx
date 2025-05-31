import React, { useContext, useEffect } from "react";
import { useSession } from "../../context/SessionContext";
import { ThemeContext } from "../../context/ThemeContext";
import { countryData } from "../../constants/countryFlags";
import ResultCard from "../ResultCard/ResultCard";
import styles from "./ResultList.module.css";

const ResultList = () => {
    const { selectedCountry, searchTerm } = useSession();
    const {
        extractedData,
        setSelectedCards,
        filterMode, selectedCards
    } = useSession();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;

    if (!extractedData || extractedData.length === 0) return null;

    useEffect(() => {
        if (filterMode === "All" && extractedData.length > 0) {
            const allIds = extractedData
                .map(getUniqueId)
                .filter((id) => id !== null);

            setSelectedCards((prev) => {
                const newIds = allIds.filter((id) => !prev.includes(id));
                return [...prev, ...newIds];
            });
        }
    }, [filterMode, extractedData, setSelectedCards]);

    const getUniqueId = (item) => {
        return (
            item.id_number ||
            item.passport_number ||
            item.resume_id ||
            item.diploma_id ||
            item.document_id ||
            (item.code_iban && item.code_bic && `${item.code_iban}_${item.code_bic}`) ||

            (item.full_name && item.date_of_birth && `${item.full_name}_${item.date_of_birth}`) || null


        );
    };

    const normalizeCountry = (input) => {
        const lower = input?.toLowerCase();
        const match = countryData.find(
            (c) =>
                c.name.toLowerCase() === lower ||
                c.isoAlpha3?.toLowerCase() === lower ||
                (Array.isArray(c.aliases) &&
                    c.aliases.some((alias) => alias.toLowerCase() === lower))
        );
        return match?.name.toLowerCase();
    };

    const hasSearch = searchTerm?.trim().length > 0;
    const hasCountry = selectedCountry?.toLowerCase() !== "anywhere";

    const uniqueData = Array.from(
        new Map(extractedData.map(item => [getUniqueId(item), item])).values()
    );

    const filteredData = uniqueData.filter((item) => {
        const matchesSearch = hasSearch
            ? Object.values(item).some(
                (val) =>
                    typeof val === "string" &&
                    val.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : true;

        const matchesCountry = hasCountry
            ? normalizeCountry(item.country) === normalizeCountry(selectedCountry)
            : true;

        return matchesSearch && matchesCountry;
    });
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
        <div className={styles.resultList}>
            <h2 className={`${styles.title} ${isDark ? styles.darkTitle : ""}`}>
                We've found
                <span className={`${styles.numberOfUsers} ${isDark ? styles.darknumberOfUsers : ""}`}>
                    {" "}{filteredData.length}
                </span> users!
            </h2>

            {paginatedData.map((item, index) => {
                const key = getUniqueId(item) || `fallback_${index}`;
                return <ResultCard key={key} data={item} />;
            })}
            {filteredData.length > itemsPerPage && (
                <div className={styles.pagination}>
                    <button
                        className={`${styles.pageButton} ${isDark ? styles.darkPageButton : ""}`}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>

                    <span className={`${styles.pageInfo} ${isDark ? styles.darkPageInfo : ""}`}>
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        className={`${styles.pageButton} ${isDark ? styles.darkPageButton : ""}`}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </div>
            )}


        </div>

    );
};

export default ResultList;
