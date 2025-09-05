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
  {
    id: 4,
    name: "Creative",
    content: `
      <div class="p-6">
        <h2 class="text-2xl font-bold">Emily Brown</h2>
        <p class="text-sm text-gray-600">101 Elm St, City, ST 90123 | (111) 222-3333 | emily.b@email.com</p>
        <h3 class="text-lg font-semibold mt-4">Summary</h3>
        <p class="mt-2">Graphic designer with a passion for innovative visual solutions.</p>
        <h3 class="text-lg font-semibold mt-4">Work Experience</h3>
        <p class="mt-2"><strong>Graphic Designer</strong> - Design Studio, Apr 2021 - Present</p>
        <p>Created branding materials for 20+ clients.</p>
        <h3 class="text-lg font-semibold mt-4">Education</h3>
        <p class="mt-2"><strong>B.F.A. Graphic Design</strong> - Art Institute, 2017-2021</p>
        <h3 class="text-lg font-semibold mt-4">Skills</h3>
        <p class="mt-2">Adobe Photoshop, Illustrator, UI/UX</p>
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
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <h1 class="text-3xl font-bold mb-6">Resume Templates</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => handleEdit(template)}
          >
            <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
            <div
              className="text-sm text-gray-600 prose"
              dangerouslySetInnerHTML={{ __html: template.content.substring(0, 150) + "..." }}
            />
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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