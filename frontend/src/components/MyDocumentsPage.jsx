import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

const MyDocumentsPage = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://careerhub25.onrender.com/api/documents", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const onDrop = async (acceptedFiles) => {
    setLoading(true);
    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://careerhub25.onrender.com/api/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload documents");
      }
      const newDocuments = await response.json();
      setDocuments((prev) => [...prev, ...newDocuments]);
      toast.success("Documents uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents.");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "text/plain": [".txt"],
    },
    maxFiles: 5,
    maxSize: 2 * 1024 * 1024, // 2MB limit
  });

  return (
    <div className="min-h-screen bg-white font-poppins p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          My Documents
        </h2>

        <div className="mb-6">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg hover:border-purple-500 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              <span className="font-medium text-purple-600">Add Documents</span> - Drag and drop files here, or click to select (PDF, JPG, PNG, TXT, up to 2MB each)
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-600">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-purple-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              />
            </svg>
            <p className="mt-2">Loading or uploading...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <p className="text-center text-gray-600">No documents uploaded yet.</p>
            ) : (
              documents.map((doc, index) => (
                <div
                  key={doc._id || index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{doc.filename}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDocumentsPage;