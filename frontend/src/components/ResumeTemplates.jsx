import React, { useState } from "react";
import html2pdf from "html2pdf.js";

const templates = [
  {
    id: 1,
    name: "Professional",
    content: `
      <div class="p-6">
        <h2 class="text-2xl font-bold">John Doe</h2>
        <p class="text-sm text-gray-600">123 Main St, City, ST 12345 | (123) 456-7890 | john.doe@email.com</p>
        <h3 class="text-lg font-semibold mt-4">Summary</h3>
        <p class="mt-2">Experienced software engineer with 5+ years in developing scalable applications.</p>
        <h3 class="text-lg font-semibold mt-4">Work Experience</h3>
        <p class="mt-2"><strong>Software Engineer</strong> - Tech Corp, Jan 2020 - Present</p>
        <p>Designed and implemented features for a customer-facing platform.</p>
        <h3 class="text-lg font-semibold mt-4">Education</h3>
        <p class="mt-2"><strong>B.S. Computer Science</strong> - University Name, 2016-2020</p>
        <h3 class="text-lg font-semibold mt-4">Skills</h3>
        <p class="mt-2">Python, JavaScript, React, SQL</p>
      </div>
    `,
  },
  {
    id: 2,
    name: "Modern",
    content: `
      <div class="p-6">
        <h2 class="text-2xl font-bold">Jane Smith</h2>
        <p class="text-sm text-gray-600">456 Oak Ave, City, ST 67890 | (987) 654-3210 | jane.smith@email.com</p>
        <h3 class="text-lg font-semibold mt-4">Profile</h3>
        <p class="mt-2">Marketing professional with a focus on digital strategy and campaign management.</p>
        <h3 class="text-lg font-semibold mt-4">Work Experience</h3>
        <p class="mt-2"><strong>Marketing Manager</strong> - Ad Agency, Mar 2019 - Present</p>
        <p>Led campaigns increasing engagement by 30%.</p>
        <h3 class="text-lg font-semibold mt-4">Education</h3>
        <p class="mt-2"><strong>MBA</strong> - Business School, 2015-2017</p>
        <h3 class="text-lg font-semibold mt-4">Skills</h3>
        <p class="mt-2">SEO, Google Analytics, Content Creation</p>
      </div>
    `,
  },
  {
    id: 3,
    name: "Simple",
    content: `
      <div class="p-6">
        <h2 class="text-2xl font-bold">Alex Johnson</h2>
        <p class="text-sm text-gray-600">789 Pine St, City, ST 34567 | (555) 123-4567 | alex.j@email.com</p>
        <h3 class="text-lg font-semibold mt-4">Objective</h3>
        <p class="mt-2">Seeking a project management role to leverage organizational skills.</p>
        <h3 class="text-lg font-semibold mt-4">Work Experience</h3>
        <p class="mt-2"><strong>Project Coordinator</strong> - Build Co, Jun 2018 - Present</p>
        <p>Managed timelines and budgets for multiple projects.</p>
        <h3 class="text-lg font-semibold mt-4">Education</h3>
        <p class="mt-2"><strong>B.A. Business Administration</strong> - College Name, 2014-2018</p>
        <h3 class="text-lg font-semibold mt-4">Skills</h3>
        <p class="mt-2">MS Project, Team Leadership, Budgeting</p>
      </div>
    `,
  },
];

const ResumeTemplates = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedContent, setEditedContent] = useState(templates[0].content);
  const [isEditing, setIsEditing] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % templates.length);
    setEditedContent(templates[(currentIndex + 1) % templates.length].content);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
    setEditedContent(templates[(currentIndex - 1 + templates.length) % templates.length].content);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDownload = () => {
    const element = document.createElement("div");
    element.innerHTML = editedContent;
    html2pdf().from(element).save(`${templates[currentIndex].name}_Resume.pdf`);
    setIsEditing(false);
  };

  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Resume Templates</h1>
      <div className="flex flex-col items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mb-4">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: editedContent }}
          />
        </div>
        <div className="flex gap-4 mb-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={handlePrev}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleNext}
          >
            Next
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
        {isEditing && (
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">{templates[currentIndex].name} Resume Editor</h2>
            <textarea
              className="w-full h-64 p-2 border rounded mb-4"
              value={editedContent}
              onChange={handleContentChange}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleDownload}
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeTemplates;