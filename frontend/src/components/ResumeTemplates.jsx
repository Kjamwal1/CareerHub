import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js'; // Import the library
import { useNavigate } from 'react-router-dom';

const ResumeTemplates = () => {
  const navigate = useNavigate();
  const templateRefs = [useRef(), useRef(), useRef()]; // Refs for each template

  const templates = [
    {
      name: 'Chronological Resume',
      description: 'Standard format emphasizing work history in reverse chronological order. ATS-friendly with clean sections.',
    },
    {
      name: 'Functional Resume',
      description: 'Focuses on skills and experience rather than timeline. Great for career changers.',
    },
    {
      name: 'Modern Minimal Resume',
      description: 'Clean, concise design with bold headings. Simple fonts and structure for ATS compatibility.',
    },
    // Add more templates as needed
  ];

  const downloadPDF = (index) => {
    const element = templateRefs[index].current;
    const opt = {
      margin: 0.5,
      filename: `${templates[index].name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-8">Resume Templates</h1>
      <p className="mb-6 text-gray-600">
        Choose a template below. Edit the content directly, then download as PDF. All templates are ATS-friendly (plain text, standard fonts, no graphics).
      </p>
      {templates.map((template, index) => (
        <div key={template.name} className="mb-12 border p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">{template.name}</h2>
          <p className="mb-4 text-gray-500">{template.description}</p>
          <div
            ref={templateRefs[index]}
            className="bg-white p-6 border border-gray-300 max-w-3xl mx-auto"
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt', lineHeight: '1.5' }}
            contentEditable={true}
            suppressContentEditableWarning={true}
          >
            {/* Template-specific content */}
            {index === 0 && (
              <>
                <h1 contentEditable={true} style={{ fontSize: '18pt', fontWeight: 'bold', textAlign: 'center' }}>Your Name</h1>
                <p contentEditable={true} style={{ textAlign: 'center' }}>Your Address | Phone | Email | LinkedIn</p>
                <hr style={{ margin: '10px 0' }} />
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold' }}>Professional Summary</h2>
                <p contentEditable={true}>A brief summary of your professional background and key skills.</p>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold' }}>Work Experience</h2>
                <p contentEditable={true}><strong>Job Title</strong>, Company Name, City, State — Dates</p>
                <ul contentEditable={true} style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                  <li>Achievement or responsibility.</li>
                  <li>Another bullet point.</li>
                </ul>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold' }}>Education</h2>
                <p contentEditable={true}><strong>Degree</strong>, Institution, Graduation Year</p>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold' }}>Skills</h2>
                <ul contentEditable={true} style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                  <li>Skill 1</li>
                  <li>Skill 2</li>
                </ul>
              </>
            )}
            {index === 1 && (
              <>
                <h1 contentEditable={true} style={{ fontSize: '18pt', fontWeight: 'bold', textAlign: 'center' }}>Your Name</h1>
                <p contentEditable={true} style={{ textAlign: 'center' }}>Your Address | Phone | Email | LinkedIn</p>
                <hr style={{ margin: '10px 0' }} />
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold' }}>Skills Summary</h2>
                <ul contentEditable={true} style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                  <li>Key Skill 1: Description of experience.</li>
                  <li>Key Skill 2: Description of experience.</li>
                </ul>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold' }}>Professional Experience</h2>
                <p contentEditable={true}><strong>Job Title</strong>, Company Name — Dates</p>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold' }}>Education</h2>
                <p contentEditable={true}><strong>Degree</strong>, Institution, Graduation Year</p>
              </>
            )}
            {index === 2 && (
              <>
                <h1 contentEditable={true} style={{ fontSize: '18pt', fontWeight: 'bold' }}>Your Name</h1>
                <p contentEditable={true}>Phone | Email | LinkedIn | Location</p>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '5px' }}>Summary</h2>
                <p contentEditable={true}>Concise professional summary.</p>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '5px' }}>Experience</h2>
                <p contentEditable={true}><strong>Job Title</strong> at Company — Dates</p>
                <ul contentEditable={true} style={{ listStyleType: 'none', marginLeft: '0' }}>
                  <li>- Achievement 1</li>
                  <li>- Achievement 2</li>
                </ul>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '5px' }}>Education</h2>
                <p contentEditable={true}>Degree from Institution, Year</p>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '5px' }}>Skills</h2>
                <p contentEditable={true}>Skill 1, Skill 2, Skill 3</p>
              </>
            )}
          </div>
          <button
            onClick={() => downloadPDF(index)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download as PDF
          </button>
        </div>
      ))}
      <button
        onClick={() => navigate('/home')}
        className="mt-8 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ResumeTemplates;