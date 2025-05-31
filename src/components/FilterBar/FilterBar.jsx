import React, { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext'
import styles from './FilterBar.module.css'
import CustomSelect from './CustomSelect'
import { useSession } from "../../context/SessionContext";
import { translations } from "../../constants/translations";
const FilterBar = () => {
  const { theme } = useContext(ThemeContext)
  const isDark = theme === 'dark'
  const { lang } = useSession();

  const t = translations[lang];

  const {
    selectedCountry,
    setSelectedCountry,
    searchTerm,
    setSearchTerm,
    detectedCountries
  } = useSession();
  const countryOptions = [{ name: t.anywhere, flag: "📡" }, ...detectedCountries];

  const handleCountryChange = (value) => setSelectedCountry(value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  return (
    <div className={`${styles.filterBar} ${isDark ? styles.dark : ''}`}>
      <div className={styles.title}>{t.results}</div>
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <span className={styles.icon}>🔍</span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div>

        </div>
        <CustomSelect
          options={countryOptions}
          value={countryOptions.find((c) => c.name === selectedCountry)}
          onChange={(selected) => handleCountryChange(selected.name)}
          getOptionLabel={(option) => `${option.flag} ${option.name}`}
          icon="📍"
        />

      </div>
    </div>
  )
}

export default FilterBar
