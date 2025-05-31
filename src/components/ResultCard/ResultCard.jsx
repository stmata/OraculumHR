import React, { useState } from "react";
import { useSession } from "../../context/SessionContext";
import InfoModal from "../InfoModal/InfoModal";
import IDCardResult from "../Results/IDCardResult";
import PassportResult from "../Results/PassportResult/PassportResult";
import ResumeResult from "../Results/ResumeResult/ResumeResult";
import DiplomaResult from "../Results/DiplomaResult/DiplomaResult";
import BankResult from "../Results/BankResult/BankResult";

const ResultCard = ({ data }) => {
  const {
    docType,
    extractedData,
    setExtractedData
  } = useSession();

  const [isModalOpen, setModalOpen] = useState(false);

  const handleDoubleClick = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const generateId = (item) => {
    const exportId =
      item.full_name && item.date ? `${item.full_name}${item.date}` : null;
    const cleanIban = (item.code_iban || "").replace(/\s+/g, "");
    const cleanBic = (item.code_bic || "").replace(/\s+/g, "");
    const bankId = cleanIban && cleanBic ? `${cleanIban}${cleanBic}` : null;
    return (
      item.id_number ||
      item.passport_number ||
      item.email ||
      item.document_id ||
      bankId ||
      exportId ||
      null
    );
  };

  const handleSave = (updatedData) => {
    setExtractedData(
      extractedData.map(item =>
        generateId(item) === generateId(data) ? updatedData : item
      )
    );
    handleClose();
  };

  let Component;
  switch (docType) {
    case "id_card":
      Component = <IDCardResult data={data} />;
      break;
    case "passport":
      Component = <PassportResult data={data} />;
      break;
    case "resume":
      Component = <ResumeResult data={data} />;
      break;
    case "diploma":
      Component = <DiplomaResult data={data} />;
      break;
    case "bank":
      Component = <BankResult data={data} />;
      break;
    default:
      return null;
  }

  return (
    <>
      <div onDoubleClick={handleDoubleClick}>
        {Component}
      </div>
      <InfoModal
        isOpen={isModalOpen}
        data={data}
        onClose={handleClose}
        onSave={handleSave}
      />
    </>
  );
};

export default ResultCard;
