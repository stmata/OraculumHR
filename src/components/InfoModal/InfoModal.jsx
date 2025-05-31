import React, { useState, useEffect, useContext } from 'react';
import styles from './InfoModal.module.css';
import { ThemeContext } from '../../context/ThemeContext';
import { translations } from '../../constants/translations';
import { useSession } from '../../context/SessionContext';

const InfoModal = ({ isOpen, data, onClose, onSave }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const { lang } = useSession();
    const t = translations[lang];
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) setFormData(data);
    }, [isOpen, data]);

    if (!isOpen) return null;

    const handleChange = (key) => (e) =>
        setFormData(prev => ({ ...prev, [key]: e.target.value }));

    const handleSave = () => onSave(formData);

    return (
        <div
            className={`${styles.overlay} ${isDark ? styles.darkOverlay : ''}`}
            onClick={onClose}
        >
            <div
                className={`${styles.modal} ${isDark ? styles.darkModal : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <span
                        className={`
              ${styles.headerTitle}
              ${isDark ? styles.darkHeaderTitle : ''}
            `}
                    >
                        {t.edit_info}
                    </span>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    {Object.entries(formData).map(([key, val]) => (
                        <div key={key} className={styles.field}>
                            <label className={styles.label}>
                                {key} :
                            </label>
                            <input
                                className={`
                  ${styles.inpute}
                  ${isDark ? styles.Drakinpute : ''}
                `}
                                type="text"
                                value={val ?? ''}
                                placeholder="—"
                                onChange={handleChange(key)}
                            />
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <button
                        className={`
              ${styles.saveButton}
              ${isDark ? styles.DraksaveButton : ''}
            `}
                        onClick={handleSave}
                    >
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
