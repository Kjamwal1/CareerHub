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
      if (!user) {
        console.log("User is not authenticated");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in localStorage");
          throw new Error("Authentication token missing");
        }
        const response = await fetch("https://careerhub25.onrender.com/api/documents", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched documents:", data);
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error.message);
        toast.error("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const onDrop = async (acceptedFiles) => {
    if (!user) {
      toast.error("Please log in to upload documents.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const response = await fetch("https://careerhub25.onrender.com/api/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Failed to upload documents: ${response.status}`);
      }
      const newDocuments = await response.json();
      setDocuments((prev) => [...prev, ...newDocuments]);
      toast.success("Documents uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error.message);
      toast.error("Failed to upload documents.");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    minSize: 1024, // 1KB minimum
    maxSize: 2 * 1024 * 1024, // 2MB maximum
    maxFiles: 5,
  });

  // Handle file rejections
  useEffect(() => {
    fileRejections.forEach((file) => {
      if (file.file.size < 1024) {
        toast.error(`${file.file.name} is too small (minimum 1KB).`);
      } else if (file.file.size > 2 * 1024 * 1024) {
        toast.error(`${file.file.name} is too large (maximum 2MB).`);
      }
    });
  }, [fileRejections]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white font-poppins p-3 sm:p-6 text-center">
        <p className="text-gray-600 text-sm sm:text-base">Please log in to view your documents.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-poppins p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
          My Documents
        </h2>

        <div className="mb-4 sm:mb-6">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 p-3 sm:p-6 text-center rounded-lg hover:border-purple-500 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600 text-sm sm:text-base">
              <span className="font-medium text-purple-600">Add Documents</span> - Drag and drop files here, or click to select (any type, 1KB to 2MB each)
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-600">
            <svg
              className="animate-spin h-6 sm:h-8 w-6 sm:w-8 mx-auto text-purple-600"
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
            <p className="mt-1 sm:mt-2 text-sm sm:text-base">Loading or uploading...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-2 sm:space-y-4">
            {documents.length === 0 ? (
              <p className="text-center text-gray-600 text-sm sm:text-base">No documents uploaded yet.</p>
            ) : (
              documents.map((doc, index) => (
                <div
                  key={doc._id || index}
                  className="p-2 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-center"
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="text-gray-800 font-medium text-sm sm:text-base">{doc.filename}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm sm:text-base"
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