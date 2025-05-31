import { postFormData, postJSON } from "../services/api";

const extractEndpoints = {
  id_card: "/api/idcard/extract",
  passport: "/api/passport/extract",
  bank: "/api/bank/extract",
  resume: "/api/resume/extract",
  diploma: "/api/diploma/extract",
};

const exportEndpoints = {
  id_card: "/api/idcard/export",
  passport: "/api/passport/export",
  bank: "/api/bank/export",
  resume: "/api/resume/export",
  diploma: "/api/diploma/export",
};

export const extractDocuments = async (docType, files) => {
  if (!extractEndpoints[docType]) {
    throw new Error("Unsupported document type for extraction");
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return await postFormData(extractEndpoints[docType], formData);
};

export const exportDocuments = async (docType, documents, format = "pdf") => {
  if (!exportEndpoints[docType]) {
    throw new Error("Unsupported document type for export");
  }

  return await postJSON(exportEndpoints[docType], { documents }, format);
};
