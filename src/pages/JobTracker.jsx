import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Briefcase, Upload, Trash2, Plus } from "lucide-react";

const JobTracker = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    url: "",
    reminderDate: "",
    status: "Applied",
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const response = await fetch("http://localhost:5000/api/jobs", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError("Failed to fetch jobs: " + err.message);
      }
    };
    if (user) fetchJobs();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const formDataToSend = new FormData();
      if (file) {
        formDataToSend.append("file", file);
      } else {
        Object.keys(formData).forEach((key) => {
          if (formData[key]) formDataToSend.append(key, formData[key]);
        });
      }
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setJobs((prev) => [data.job || { ...formData, createdAt: new Date() }, ...prev]);
      setFormData({
        title: "",
        company: "",
        description: "",
        url: "",
        reminderDate: "",
        status: "Applied",
      });
      setFile(null);
      setShowForm(false);
    } catch (err) {
      setError("Failed to add job: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setJobs((prev) => prev.map((job) => (job._id === id ? data.job : job)));
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  };

  const deleteJob = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setJobs((prev) => prev.filter((job) => job._id !== id));
    } catch (err) {
      setError("Failed to delete job: " + err.message);
    }
  };

  const getJobsByStatus = (status) => jobs.filter((job) => job.status === status);

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-full h-full bg-white rounded-lg shadow-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Briefcase className="mr-2 text-blue-500" size={24} />
            Job Tracker
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            <Plus className="mr-2 inline" size={18} /> Add Job
          </button>
        </div>
        {error && <p className="p-4 text-red-500">{error}</p>}
        <div className="p-4">
          <div className="grid grid-cols-5 w-full h-full gap-4">
            {["Saved", "Applied", "Interviewing", "Rejected", "Offer"].map((status) => (
              <div key={status} className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full overflow-auto">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{status}</h3>
                {getJobsByStatus(status).length === 0 ? (
                  <p className="text-gray-500">No jobs in this category.</p>
                ) : (
                  getJobsByStatus(status).map((job) => (
                    <div key={job._id} className="mb-4 p-3 bg-white rounded-md border border-gray-100">
                      <h4 className="text-md font-medium text-gray-800">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <div className="flex items-center justify-between mt-2">
                        <select
                          value={job.status}
                          onChange={(e) => updateStatus(job._id, e.target.value)}
                          className="p-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Saved">Saved</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Offer">Offer</option>
                        </select>
                        <button
                          onClick={() => deleteJob(job._id)}
                          className="p-1 bg-red-100 rounded-full hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="text-red-500" size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Add New Job</h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Job Title"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Job Description"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="Job URL"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Offer">Offer</option>
                </select>
                <div className="flex items-center">
                  <label className="p-3 bg-gray-100 rounded-lg flex items-center cursor-pointer">
                    <Upload className="mr-2 text-gray-600" size={20} />
                    <span>Import CSV</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Save Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTracker;