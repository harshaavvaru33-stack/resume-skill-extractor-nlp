// ==========================================================================
// Resume Hub State & Configuration
// ==========================================================================
let resumeData = {
    personal_info: {
        name: "Akash Kumar",
        email: "akash.kumar@example.com",
        phone: "+91 98765 43210",
        location: "Bangalore, India",
        linkedin: "linkedin.com/in/akashkumar",
        github: "github.com/akashkumar",
        summary: "Passionate Software Engineer with experience in building scalable web APIs and machine learning models. Adept in software architectures and cloud-native developments."
    },
    skills: {
        "Languages": ["Python", "Java", "SQL", "JavaScript"],
        "Frameworks & Libraries": ["FastAPI", "TensorFlow", "React", "Node.js"],
        "Databases & Cache": ["PostgreSQL", "Redis", "MongoDB"],
        "Cloud & DevOps": ["AWS", "Docker", "GitHub Actions"],
        "Tools & Methodologies": ["Git", "Postman", "Agile", "Scrum"]
    },
    education: [
        {
            degree: "Bachelor of Technology (B.Tech) in Computer Science",
            institution: "IIIT Bangalore",
            duration: "2017 - 2021",
            description: "Graduated with Honors. Specialized in Software Engineering."
        }
    ],
    experience: [
        {
            title: "Software Engineer",
            company: "Google",
            duration: "2021 - Present",
            description: "- Developed scalable API services using Python and FastAPI.\n- Designed and implemented data pipeline modules for analytical systems.\n- Reduced cloud hosting costs by 20% through container orchestration optimization."
        }
    ],
    projects: [
        {
            title: "AI Resume Parser & Builder",
            description: "A machine learning pipeline utilizing spaCy NLP to parse raw resume files (PDF/DOCX) into structured JSON documents, with an interactive custom designer frontend."
        }
    ]
};

// Customization parameters
let currentTemplate = "modern";
let accentColor = "#4f46e5";
let fontFamily = "Outfit";
let fontSize = "14";
let lineHeight = "1.4";
let sectionOrder = ["summary", "experience", "projects", "education", "skills"];
let zoomLevel = 100; // in percentage

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initUIControls();
    initUploadControls();
    initFormBindings();
    
    // Load initial form values and render preview
    populateFormFields();
    renderExperienceForm();
    renderEducationForm();
    renderProjectsForm();
    renderResume();
});

// ==========================================================================
// UI Tab Controls, Sidebar, Zoom, Dark Mode
// ==========================================================================
function initUIControls() {
    // Sidebar navigation tabs
    const menuItems = document.querySelectorAll(".menu-item");
    const editorPanel = document.querySelector(".editor-panel");
    const designPanel = document.querySelector(".design-panel");
    
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(m => m.classList.remove("active"));
            item.classList.add("active");
            
            const target = item.getAttribute("data-target");
            if (target === "editor") {
                editorPanel.style.display = "flex";
                designPanel.style.display = "none";
            } else {
                editorPanel.style.display = "none";
                designPanel.style.display = "flex";
            }
        });
    });

    // Accordions
    const accordions = document.querySelectorAll(".accordion-header");
    accordions.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            item.classList.toggle("expanded");
        });
    });

    // Dark mode toggle
    const themeBtn = document.getElementById("theme-toggle-btn");
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const icon = themeBtn.querySelector("i");
        if (document.body.classList.contains("dark-mode")) {
            icon.className = "fa-solid fa-sun";
        } else {
            icon.className = "fa-solid fa-moon";
        }
    });

    // Template Selector cards
    const templateCards = document.querySelectorAll(".template-card");
    templateCards.forEach(card => {
        card.addEventListener("click", () => {
            templateCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            currentTemplate = card.getAttribute("data-template");
            
            // Update preview class and render
            const preview = document.getElementById("resume-preview");
            preview.className = `resume-preview template-${currentTemplate}`;
            renderResume();
        });
    });

    // Style inputs
    const colorInput = document.getElementById("style-accent-color");
    colorInput.addEventListener("input", (e) => {
        accentColor = e.target.value;
        document.querySelector(".color-value").innerText = accentColor;
        renderResume();
    });

    const fontInput = document.getElementById("style-font-family");
    fontInput.addEventListener("change", (e) => {
        fontFamily = e.target.value;
        renderResume();
    });

    const fontSizeInput = document.getElementById("style-font-size");
    fontSizeInput.addEventListener("input", (e) => {
        fontSize = e.target.value;
        document.querySelector("#style-font-size + .range-value").innerText = `${fontSize}px`;
        renderResume();
    });

    const lineHeightInput = document.getElementById("style-line-height");
    lineHeightInput.addEventListener("input", (e) => {
        lineHeight = e.target.value;
        document.querySelector("#style-line-height + .range-value").innerText = lineHeight;
        renderResume();
    });

    // Zoom Controls
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomLabel = document.getElementById("zoom-percentage");
    const previewContainer = document.getElementById("resume-preview");

    zoomInBtn.addEventListener("click", () => {
        if (zoomLevel < 150) {
            zoomLevel += 10;
            updateZoom();
        }
    });

    zoomOutBtn.addEventListener("click", () => {
        if (zoomLevel > 60) {
            zoomLevel -= 10;
            updateZoom();
        }
    });

    function updateZoom() {
        zoomLabel.innerText = `${zoomLevel}%`;
        previewContainer.style.transform = `scale(${zoomLevel / 100})`;
        // Readjust container height to prevent white overlap gap
        const scaledHeight = previewContainer.getBoundingClientRect().height;
        const sheetContainer = document.querySelector(".resume-sheet-container");
        sheetContainer.style.minHeight = `${scaledHeight + 64}px`;
    }

    // Drag-sort sections
    const sortableList = document.getElementById("section-order-list");
    let draggingItem = null;

    sortableList.addEventListener("dragstart", (e) => {
        draggingItem = e.target;
        e.target.classList.add("dragging");
    });

    sortableList.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
        draggingItem = null;
        
        // Re-read order from list
        const items = [...sortableList.querySelectorAll(".sortable-item")];
        sectionOrder = items.map(item => item.getAttribute("data-section"));
        renderResume();
    });

    sortableList.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(sortableList, e.clientY);
        if (afterElement == null) {
            sortableList.appendChild(draggingItem);
        } else {
            sortableList.insertBefore(draggingItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(".sortable-item:not(.dragging)")];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Set sorting elements as draggable
    sortableList.querySelectorAll(".sortable-item").forEach(item => {
        item.setAttribute("draggable", "true");
    });

    // Print & Save Actions
    document.getElementById("btn-print").addEventListener("click", () => {
        window.print();
    });

    document.getElementById("btn-download-json").addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${resumeData.personal_info.name.replace(/\s+/g, '_')}_resume.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

// ==========================================================================
// File Upload & Parser Pipeline
// ==========================================================================
function initUploadControls() {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const uploadStatus = document.getElementById("upload-status");
    const statusText = document.getElementById("status-text");

    // Drag-over styling
    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFileUpload(files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    function handleFileUpload(file) {
        // Show status spinner
        uploadStatus.style.display = "flex";
        statusText.innerText = `Parsing "${file.name}"...`;

        const formData = new FormData();
        formData.append("file", file);

        fetch("/api/parse", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || "Server error") });
            }
            return response.json();
        })
        .then(data => {
            // Success: update state
            resumeData = data;
            
            // Update form controls & preview
            populateFormFields();
            renderExperienceForm();
            renderEducationForm();
            renderProjectsForm();
            renderResume();
            
            statusText.innerText = "Parsing complete! Profile updated.";
            setTimeout(() => {
                uploadStatus.style.display = "none";
            }, 1500);
        })
        .catch(err => {
            console.error("Upload error:", err);
            statusText.innerHTML = `<span style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${err.message}</span>`;
            setTimeout(() => {
                uploadStatus.style.display = "none";
            }, 3000);
        });
    }
}

// ==========================================================================
// Form Data Binding
// ==========================================================================
function initFormBindings() {
    // Bind simple personal info inputs
    const bindings = {
        "input-name": ["personal_info", "name"],
        "input-email": ["personal_info", "email"],
        "input-phone": ["personal_info", "phone"],
        "input-location": ["personal_info", "location"],
        "input-linkedin": ["personal_info", "linkedin"],
        "input-github": ["personal_info", "github"],
        "input-summary": ["personal_info", "summary"]
    };

    Object.entries(bindings).forEach(([id, path]) => {
        const input = document.getElementById(id);
        input.addEventListener("input", (e) => {
            resumeData[path[0]][path[1]] = e.target.value;
            renderResume();
        });
    });

    // Bind skills inputs
    const skillInputs = {
        "skills-languages": "Languages",
        "skills-frameworks": "Frameworks & Libraries",
        "skills-databases": "Databases & Cache",
        "skills-cloud": "Cloud & DevOps",
        "skills-tools": "Tools & Methodologies"
    };

    Object.entries(skillInputs).forEach(([id, category]) => {
        const input = document.getElementById(id);
        input.addEventListener("input", (e) => {
            resumeData.skills[category] = e.target.value
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);
            renderResume();
        });
    });

    // Add buttons for dynamic sections
    document.getElementById("btn-add-experience").addEventListener("click", () => {
        resumeData.experience.push({
            title: "Job Title",
            company: "Company Name",
            duration: "Duration",
            description: ""
        });
        renderExperienceForm();
        renderResume();
    });

    document.getElementById("btn-add-education").addEventListener("click", () => {
        resumeData.education.push({
            degree: "Degree",
            institution: "University / School",
            duration: "Duration",
            description: ""
        });
        renderEducationForm();
        renderResume();
    });

    document.getElementById("btn-add-project").addEventListener("click", () => {
        resumeData.projects.push({
            title: "Project Name",
            description: "Brief description of achievements/technologies."
        });
        renderProjectsForm();
        renderResume();
    });
}

function populateFormFields() {
    // Prepopulate Personal Details
    document.getElementById("input-name").value = resumeData.personal_info.name || "";
    document.getElementById("input-email").value = resumeData.personal_info.email || "";
    document.getElementById("input-phone").value = resumeData.personal_info.phone || "";
    document.getElementById("input-location").value = resumeData.personal_info.location || "";
    document.getElementById("input-linkedin").value = resumeData.personal_info.linkedin || "";
    document.getElementById("input-github").value = resumeData.personal_info.github || "";
    document.getElementById("input-summary").value = resumeData.personal_info.summary || "";

    // Prepopulate Skills
    document.getElementById("skills-languages").value = (resumeData.skills["Languages"] || []).join(", ");
    document.getElementById("skills-frameworks").value = (resumeData.skills["Frameworks & Libraries"] || []).join(", ");
    document.getElementById("skills-databases").value = (resumeData.skills["Databases & Cache"] || []).join(", ");
    document.getElementById("skills-cloud").value = (resumeData.skills["Cloud & DevOps"] || []).join(", ");
    document.getElementById("skills-tools").value = (resumeData.skills["Tools & Methodologies"] || []).join(", ");
}

// ==========================================================================
// Dynamic Repeaters (Work, Edu, Projects) Forms Renderers
// ==========================================================================
function renderExperienceForm() {
    const list = document.getElementById("experience-list");
    list.innerHTML = "";
    
    resumeData.experience.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "repeater-item";
        div.innerHTML = `
            <div class="repeater-item-header">
                <span class="repeater-item-title">Experience Item #${index + 1}</span>
                <button type="button" class="btn-remove" onclick="removeExperience(${index})" title="Delete entry"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="form-group col-6">
                    <label>Job Title</label>
                    <input type="text" value="${item.title || ''}" oninput="updateExperience(${index}, 'title', this.value)" placeholder="e.g. Software Engineer">
                </div>
                <div class="form-group col-6">
                    <label>Company</label>
                    <input type="text" value="${item.company || ''}" oninput="updateExperience(${index}, 'company', this.value)" placeholder="e.g. Google">
                </div>
                <div class="form-group col-6">
                    <label>Duration / Period</label>
                    <input type="text" value="${item.duration || ''}" oninput="updateExperience(${index}, 'duration', this.value)" placeholder="e.g. Jan 2021 - Present">
                </div>
                <div class="form-group col-12">
                    <label>Job Description & Achievements</label>
                    <textarea rows="3" oninput="updateExperience(${index}, 'description', this.value)" placeholder="Include dashes/bullet points...">${item.description || ''}</textarea>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

window.removeExperience = (index) => {
    resumeData.experience.splice(index, 1);
    renderExperienceForm();
    renderResume();
};

window.updateExperience = (index, field, value) => {
    resumeData.experience[index][field] = value;
    renderResume();
};

function renderEducationForm() {
    const list = document.getElementById("education-list");
    list.innerHTML = "";
    
    resumeData.education.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "repeater-item";
        div.innerHTML = `
            <div class="repeater-item-header">
                <span class="repeater-item-title">Education Item #${index + 1}</span>
                <button type="button" class="btn-remove" onclick="removeEducation(${index})" title="Delete entry"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="form-group col-6">
                    <label>Degree / Field of Study</label>
                    <input type="text" value="${item.degree || ''}" oninput="updateEducation(${index}, 'degree', this.value)" placeholder="e.g. B.Tech in CSE">
                </div>
                <div class="form-group col-6">
                    <label>Institution / School</label>
                    <input type="text" value="${item.institution || ''}" oninput="updateEducation(${index}, 'institution', this.value)" placeholder="e.g. IIT Delhi">
                </div>
                <div class="form-group col-6">
                    <label>Duration / Period</label>
                    <input type="text" value="${item.duration || ''}" oninput="updateEducation(${index}, 'duration', this.value)" placeholder="e.g. 2017 - 2021">
                </div>
                <div class="form-group col-12">
                    <label>Additional Details (GPA, Awards, etc.)</label>
                    <textarea rows="2" oninput="updateEducation(${index}, 'description', this.value)" placeholder="Optional details...">${item.description || ''}</textarea>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

window.removeEducation = (index) => {
    resumeData.education.splice(index, 1);
    renderEducationForm();
    renderResume();
};

window.updateEducation = (index, field, value) => {
    resumeData.education[index][field] = value;
    renderResume();
};

function renderProjectsForm() {
    const list = document.getElementById("projects-list");
    list.innerHTML = "";
    
    resumeData.projects.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "repeater-item";
        div.innerHTML = `
            <div class="repeater-item-header">
                <span class="repeater-item-title">Project Item #${index + 1}</span>
                <button type="button" class="btn-remove" onclick="removeProject(${index})" title="Delete entry"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            <div class="form-grid">
                <div class="form-group col-12">
                    <label>Project Title / Name</label>
                    <input type="text" value="${item.title || ''}" oninput="updateProject(${index}, 'title', this.value)" placeholder="e.g. Portfolio Website">
                </div>
                <div class="form-group col-12">
                    <label>Project Details / Tech Stack</label>
                    <textarea rows="3" oninput="updateProject(${index}, 'description', this.value)" placeholder="Describe what you built and the tools used...">${item.description || ''}</textarea>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

window.removeProject = (index) => {
    resumeData.projects.splice(index, 1);
    renderProjectsForm();
    renderResume();
};

window.updateProject = (index, field, value) => {
    resumeData.projects[index][field] = value;
    renderResume();
};

// ==========================================================================
// RESUME HTML BUILDERS & RENDER ENGINE
// ==========================================================================
function renderResume() {
    const preview = document.getElementById("resume-preview");
    
    // Set custom styles globally on the sheet
    preview.style.setProperty("--primary-color", accentColor);
    const rgb = hexToRgb(accentColor);
    if (rgb) {
        preview.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    preview.style.fontFamily = fontFamily;
    preview.style.fontSize = `${fontSize}px`;
    preview.style.lineHeight = lineHeight;

    // Generate output HTML based on selected template
    let htmlContent = "";
    
    if (currentTemplate === "modern") {
        htmlContent = buildModernTemplate();
    } else if (currentTemplate === "academic") {
        htmlContent = buildAcademicTemplate();
    } else if (currentTemplate === "tech") {
        htmlContent = buildTechTemplate();
    }
    
    preview.innerHTML = htmlContent;
}

// Helpers
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function formatBulletPoints(desc) {
    if (!desc) return "";
    
    const lines = desc.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1 && !desc.startsWith("-") && !desc.startsWith("•") && !desc.startsWith("*")) {
        return `<p>${desc}</p>`;
    }
    
    let html = "<ul>";
    lines.forEach(line => {
        const cleanLine = line.replace(/^[•\-\*\s]+/, "").trim();
        html += `<li>${cleanLine}</li>`;
    });
    html += "</ul>";
    return html;
}

// ==========================================================================
// Template Builder 1: Modern Sidebar
// ==========================================================================
function buildModernTemplate() {
    const info = resumeData.personal_info;
    const skills = resumeData.skills;
    
    // Left column: Personal/Contact details & Skills
    let leftColHtml = `
        <div class="modern-left-col">
            <div>
                <h1>${info.name || 'Candidate Name'}</h1>
                <div class="candidate-title">${resumeData.experience.length ? resumeData.experience[0].title : 'Developer'}</div>
            </div>
            
            <div class="modern-skills-section">
                <h2>Contact</h2>
                <div class="modern-contact-info">
                    ${info.email ? `<span><i class="fa-solid fa-envelope"></i> ${info.email}</span>` : ''}
                    ${info.phone ? `<span><i class="fa-solid fa-phone"></i> ${info.phone}</span>` : ''}
                    ${info.location ? `<span><i class="fa-solid fa-location-dot"></i> ${info.location}</span>` : ''}
                    ${info.linkedin ? `<a href="https://${info.linkedin}" target="_blank"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>` : ''}
                    ${info.github ? `<a href="https://${info.github}" target="_blank"><i class="fa-brands fa-github"></i> GitHub</a>` : ''}
                </div>
            </div>
            
            <div class="modern-skills-section">
                <h2>Skills</h2>
    `;
    
    // Iterate over skill categories
    Object.entries(skills).forEach(([category, list]) => {
        if (list && list.length) {
            leftColHtml += `
                <div class="modern-skill-category">
                    <h4>${category}</h4>
                    <div class="modern-skill-tags">
                        ${list.map(s => `<span class="modern-skill-tag">${s}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    leftColHtml += `
            </div>
        </div>
    `;

    // Right column: Experience, Education, Projects ordered dynamically
    let rightColHtml = `<div class="modern-right-col">`;
    
    sectionOrder.forEach(section => {
        if (section === "summary" && info.summary) {
            rightColHtml += `
                <div class="preview-section">
                    <h2>Professional Summary</h2>
                    <div class="modern-summary">${info.summary}</div>
                </div>
            `;
        } else if (section === "experience" && resumeData.experience.length) {
            rightColHtml += `
                <div class="preview-section">
                    <h2>Experience</h2>
                    ${resumeData.experience.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <span>${item.title}</span>
                                <span class="entry-duration">${item.duration}</span>
                            </div>
                            <div class="entry-subheader">
                                <span>${item.company}</span>
                            </div>
                            <div class="entry-description">${formatBulletPoints(item.description)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "projects" && resumeData.projects.length) {
            rightColHtml += `
                <div class="preview-section">
                    <h2>Projects</h2>
                    ${resumeData.projects.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <span>${item.title}</span>
                            </div>
                            <div class="entry-description">${formatBulletPoints(item.description)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "education" && resumeData.education.length) {
            rightColHtml += `
                <div class="preview-section">
                    <h2>Education</h2>
                    ${resumeData.education.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <span>${item.degree}</span>
                                <span class="entry-duration">${item.duration}</span>
                            </div>
                            <div class="entry-subheader">
                                <span>${item.institution}</span>
                            </div>
                            ${item.description ? `<div class="entry-description">${item.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    });
    
    rightColHtml += `</div>`;

    return leftColHtml + rightColHtml;
}

// ==========================================================================
// Template Builder 2: Clean Academic
// ==========================================================================
function buildAcademicTemplate() {
    const info = resumeData.personal_info;
    const skills = resumeData.skills;
    
    // Top Centered Header
    let html = `
        <div class="template-academic">
            <div class="academic-header">
                <h1>${info.name || 'Candidate Name'}</h1>
                <div class="academic-title">${resumeData.experience.length ? resumeData.experience[0].title : 'Professional Profile'}</div>
                <div class="academic-contact">
                    ${info.email ? `<span><i class="fa-solid fa-envelope"></i> ${info.email}</span>` : ''}
                    ${info.phone ? `<span><i class="fa-solid fa-phone"></i> ${info.phone}</span>` : ''}
                    ${info.location ? `<span><i class="fa-solid fa-location-dot"></i> ${info.location}</span>` : ''}
                    ${info.linkedin ? `<a href="https://${info.linkedin}" target="_blank"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>` : ''}
                    ${info.github ? `<a href="https://${info.github}" target="_blank"><i class="fa-brands fa-github"></i> GitHub</a>` : ''}
                </div>
            </div>
    `;

    // Render sections in order
    sectionOrder.forEach(section => {
        if (section === "summary" && info.summary) {
            html += `
                <div class="academic-section">
                    <h2>Summary</h2>
                    <div class="academic-summary">${info.summary}</div>
                </div>
            `;
        } else if (section === "experience" && resumeData.experience.length) {
            html += `
                <div class="academic-section">
                    <h2>Work History</h2>
                    ${resumeData.experience.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <strong>${item.title}</strong>
                                <span class="entry-duration">${item.duration}</span>
                            </div>
                            <div class="entry-subheader">
                                <em>${item.company}</em>
                            </div>
                            <div class="entry-description">${formatBulletPoints(item.description)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "projects" && resumeData.projects.length) {
            html += `
                <div class="academic-section">
                    <h2>Projects</h2>
                    ${resumeData.projects.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <strong>${item.title}</strong>
                            </div>
                            <div class="entry-description">${formatBulletPoints(item.description)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "education" && resumeData.education.length) {
            html += `
                <div class="academic-section">
                    <h2>Education</h2>
                    ${resumeData.education.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <strong>${item.degree}</strong>
                                <span class="entry-duration">${item.duration}</span>
                            </div>
                            <div class="entry-subheader">
                                <span>${item.institution}</span>
                            </div>
                            ${item.description ? `<div class="entry-description">${item.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "skills") {
            let hasSkills = Object.values(skills).some(list => list && list.length);
            if (hasSkills) {
                html += `
                    <div class="academic-section">
                        <h2>Technical Skills</h2>
                        <div class="academic-skills-list">
                `;
                Object.entries(skills).forEach(([category, list]) => {
                    if (list && list.length) {
                        html += `
                            <div class="academic-skill-line">
                                <strong>${category}:</strong> ${list.join(', ')}
                            </div>
                        `;
                    }
                });
                html += `
                        </div>
                    </div>
                `;
            }
        }
    });

    html += `</div>`;
    return html;
}

// ==========================================================================
// Template Builder 3: Tech Developer Grid
// ==========================================================================
function buildTechTemplate() {
    const info = resumeData.personal_info;
    const skills = resumeData.skills;
    
    // Modern Dev Header split
    let html = `
        <div class="template-tech">
            <div class="tech-header">
                <div>
                    <h1>${info.name || 'Candidate Name'}</h1>
                    <div class="tech-title">${resumeData.experience.length ? resumeData.experience[0].title : 'Engineer'}</div>
                </div>
                <div class="tech-header-contact">
                    ${info.email ? `<span>${info.email} <i class="fa-solid fa-envelope"></i></span>` : ''}
                    ${info.phone ? `<span>${info.phone} <i class="fa-solid fa-phone"></i></span>` : ''}
                    ${info.location ? `<span>${info.location} <i class="fa-solid fa-location-dot"></i></span>` : ''}
                    ${info.linkedin ? `<a href="https://${info.linkedin}" target="_blank">${info.linkedin.replace("linkedin.com/in/", "linkedin://")} <i class="fa-brands fa-linkedin"></i></a>` : ''}
                    ${info.github ? `<a href="https://${info.github}" target="_blank">${info.github.replace("github.com/", "@")} <i class="fa-brands fa-github"></i></a>` : ''}
                </div>
            </div>
    `;

    // Render sections in order
    sectionOrder.forEach(section => {
        if (section === "summary" && info.summary) {
            html += `
                <div class="tech-section">
                    <h2>Summary</h2>
                    <div class="tech-summary">${info.summary}</div>
                </div>
            `;
        } else if (section === "experience" && resumeData.experience.length) {
            html += `
                <div class="tech-section">
                    <h2>Experience</h2>
                    ${resumeData.experience.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <strong>${item.title}</strong>
                                <span class="entry-duration">${item.duration}</span>
                            </div>
                            <div class="entry-subheader">
                                <span style="color: var(--primary-color); font-weight:600;">${item.company}</span>
                            </div>
                            <div class="entry-description">${formatBulletPoints(item.description)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "projects" && resumeData.projects.length) {
            html += `
                <div class="tech-section">
                    <h2>Featured Projects</h2>
                    ${resumeData.projects.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <strong>${item.title}</strong>
                            </div>
                            <div class="entry-description">${formatBulletPoints(item.description)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "education" && resumeData.education.length) {
            html += `
                <div class="tech-section">
                    <h2>Education</h2>
                    ${resumeData.education.map(item => `
                        <div class="preview-entry">
                            <div class="entry-header">
                                <strong>${item.degree}</strong>
                                <span class="entry-duration">${item.duration}</span>
                            </div>
                            <div class="entry-subheader">
                                <span>${item.institution}</span>
                            </div>
                            ${item.description ? `<div class="entry-description">${item.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (section === "skills") {
            let hasSkills = Object.values(skills).some(list => list && list.length);
            if (hasSkills) {
                html += `
                    <div class="tech-section">
                        <h2>Tech Stack & Expertise</h2>
                        <div class="tech-skills-grid">
                `;
                Object.entries(skills).forEach(([category, list]) => {
                    if (list && list.length) {
                        html += `
                            <div class="tech-skill-card">
                                <h4>${category}</h4>
                                <div class="tech-skill-pills">
                                    ${list.map(s => `<span class="tech-skill-pill">${s}</span>`).join('')}
                                </div>
                            </div>
                        `;
                    }
                });
                html += `
                        </div>
                    </div>
                `;
            }
        }
    });

    html += `</div>`;
    return html;
}
