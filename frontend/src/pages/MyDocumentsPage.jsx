import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const MyDocumentsPage = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
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
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Error fetching documents");
        }
        setDocuments(data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !description) {
      toast.error("Please select a file and add a description.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://careerhub25.onrender.com/api/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error uploading document");
      }
      setDocuments([...documents, data]);
      setFile(null);
      setDescription("");
      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#0a0a23] to-[#12123a] font-poppins flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          My Documents
        </h2>

        {loading && (
          <div className="text-center text-gray-600">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-purple-600"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
            </svg>
            <p className="mt-2">Loading...</p>
          </div>
        )}

        {!loading && (
          <div>
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Add a description for your document..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                disabled={loading}
              >
                Upload
              </button>
            </form>

            {documents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Stored Documents
                </h3>
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <p className="text-sm text-gray-500 mb-2">
                      Uploaded on: {new Date(doc.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Description: {doc.description}
                    </p>
                    <a
                      href={`https://careerhub25.onrender.com/uploads/${doc.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            )}
            {documents.length === 0 && (
              <p className="text-center text-gray-600">
                No documents uploaded yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDocumentsPage;