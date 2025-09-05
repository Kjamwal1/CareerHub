import React, { useState } from "react";
import html2pdf from "html2pdf.js";

const templates = [
  {
    id: 1,
    name: "Professional",
    content: `
      <div class="p-4">
        <h2 class="text-xl font-bold">John Doe</h2>
        <p class="text-sm">123 Main St, City, ST 12345 | (123) 456-7890 | john.doe@email.com</p>
        <h3 class="text-lg font-semibold mt-4">Summary</h3>
        <p>Experienced software engineer with 5+ years in developing scalable applications.</p>
        <h3 class="text-lg font-semibold mt-4">Work Experience</h3>
        <p><strong>Software Engineer</strong> - Tech Corp, Jan 2020 - Present</p>
        <p>Designed and implemented features for a customer-facing platform.</p>
        <h3 class="text-lg font-semibold mt-4">Education</h3>
        <p><strong>B.S. Computer Science</strong> - University Name, 2016-2020</p>
        <h3 class="text-lg font-semibold mt-4">Skills</h3>
        <p>Python, JavaScript, React, SQL</p>
      </div>
    `,
  },
  {
    id: 2,
    name: "Modern",
    content: `
      <div class="p-4">
        <h2 class="text-xl font-bold">Jane Smith</h2>
        <p class="text-sm">456 Oak Ave, City, ST 67890 | (987) 654-3210 | jane.smith@email.com</p>
        <h3 class="text-lg font-semibold mt-4">Profile</h3>
        <p>Marketing professional with a focus on digital strategy and campaign management.</p>
        <h3 class="text-lg font-semibold mt-4">Work Experience</h3>
        <p><strong>Marketing Manager</strong> - Ad Agency, Mar 2019 - Present</p>
        <p>Led campaigns increasing engagement by 30%.</p>
        <h3 class="text-lg font-semibold mt-4">Education</h3>
        <p><strong>MBA</strong> - Business School, 2015-2017</p>
        <h3 class="text-lg font-semibold mt-4">Skills</h3>
        <p>SEO, Google Analytics, Content Creation</p>
      </div>
    `,
  },
  {
    id: 3,
    name: "Simple",
    content: `
      <div class="p-4">
        <h2 class="text-xl font-bold">Alex Johnson</h2>
        <p class="text-sm">789 Pine St, City, ST 34567 | (555) 123-4567 | alex.j@email.com</p>
        <h3 class="text-lg font-semibold mt-4">Objective</h3>
        <p>Seeking a project management role to leverage organizational skills.</p>
        <h3 class="text-lg font-semibold mt-4">Work Experience</h3>
        <p><strong>Project Coordinator</strong> - Build Co, Jun 2018 - Present</p>
        <p>Managed timelines and budgets for multiple projects.</p>
        <h3 class="text-lg font-semibold mt-4">Education</h3>
        <p><strong>B.A. Business Administration</strong> - College Name, 2014-2018</p>
        <h3 class="text-lg font-semibold mt-4">Skills</h3>
        <p>MS Project, Team Leadership, Budgeting</p>
      </div>
    `,
  },
];

const ResumeTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditedContent(template.content);
  };

  const handleDownload = () => {
    const element = document.createElement("div");
    element.innerHTML = editedContent;
    html2pdf().from(element).save(`${selectedTemplate.name}_Resume.pdf`);
    setSelectedTemplate(null);
  };

  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Resume Templates</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleEdit(template)}
          >
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <div
              className="mt-2 text-sm"
              dangerouslySetInnerHTML={{ __html: template.content.substring(0, 100) + "..." }}
            />
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">{selectedTemplate.name} Resume Editor</h2>
            <textarea
              className="w-full h-64 p-2 border rounded mb-4"
              value={editedContent}
              onChange={handleContentChange}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setSelectedTemplate(null)}
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
        </div>
      )}
    </div>
  );
};

export default ResumeTemplates;