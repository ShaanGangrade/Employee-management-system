const API_BASE = "/api";

// Global error handler for this script
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('Script Error:', msg, 'at', lineNo, ':', columnNo);
    return false;
};

// Toast Notification System
window.showToast = function (msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    toast.innerHTML = `${icon} <span>${msg}</span>`;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Override default alert to use error toast for better UX, optional but safe
window.alert = function (message) {
    if (message.toString().toLowerCase().includes("success") || message.toString().toLowerCase().includes("added") || message.toString().toLowerCase().includes("updated")) {
        showToast(message, 'success');
    } else {
        showToast(message, 'error');
    }
};

// Global delete function
window.deleteEmployee = async function (id, btn) {
    if (!id) return;

    // In-button double confirmation
    if (btn) {
        if (btn.innerText !== 'Confirm?') {
            btn.innerText = 'Confirm?';
            btn.style.background = '#991b1b'; // Darker red for confirm state
            setTimeout(() => {
                if (btn && btn.innerText === 'Confirm?') {
                    btn.innerText = 'DELETE';
                    btn.style.background = '#ef4444';
                }
            }, 3000); // Auto-reset after 3 seconds
            return;
        }
        btn.innerText = 'Deleting...';
        btn.style.pointerEvents = 'none';
    }

    try {
        const response = await fetch(`${API_BASE}/employees/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const errorText = await response.text();
            if (btn) { btn.innerText = 'Error'; btn.style.background = '#ef4444'; }
            alert("Error clearing employee: " + (errorText || "Server error"));
        }
    } catch (err) {
        if (btn) { btn.innerText = 'Failed'; btn.style.background = '#ef4444'; }
        alert("Connection Error. Is the backend running?");
    }
};
if (window.location.pathname.includes('dashboard.html')) {
    loadEmployees();
    loadDepartments();
}

// --- Login Logic ---
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.innerText = "Invalid username or password";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error("Login Error:", err);
        errorMsg.innerText = "Network Error. Backend might be down.";
        errorMsg.style.display = 'block';
    }
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId + '-section').style.display = 'block';

    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById('menu-' + sectionId).classList.add('active');

    if (sectionId === 'employees') loadEmployees();
    if (sectionId === 'attendance') loadAttendanceAdmin();
    if (sectionId === 'projects') loadProjects();
    if (sectionId === 'idcards') loadIdCards();
    if (sectionId === 'performance') loadPerformance();
    if (sectionId === 'departments') loadDepartmentsList();
    if (sectionId === 'leaves') loadLeaves();
}

// --- Employee Management ---
async function loadEmployees() {
    const res = await fetch(`${API_BASE}/employees`);
    const employees = await res.json();
    const list = document.getElementById('employeeList');
    list.innerHTML = '';

    let totalSalary = 0;
    let tableHTML = '';
    employees.forEach((emp, index) => {
        totalSalary += emp.salary || 0;
        tableHTML += `
            <tr style="transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                <td style="font-weight: 600; color: #6366f1;">#${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${emp.photoUrl || 'https://via.placeholder.com/40'}" style="width: 45px; height: 45px; border-radius: 12px; object-fit: cover; border: 2px solid #fff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <div>
                            <div style="font-weight: 600; color: #0f172a;">${emp.firstName} ${emp.lastName}</div>
                            <div style="font-size: 0.75rem; color: #64748b;">${emp.designation}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px; color: #475569; font-size: 0.9rem;">
                        <i class="far fa-envelope" style="color: #6366f1; font-size: 0.8rem;"></i>
                        ${emp.email}
                    </div>
                </td>
                <td style="color: #334155; font-weight: 500;">${emp.department ? emp.department.name : '<span style="color:#94a3b8">N/A</span>'}</td>
                <td style="font-weight: 700; color: #10b981;">₹${(emp.salary || 0).toLocaleString()}</td>
                <td>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="action-btn" title="Edit" onclick="console.log('Editing ${emp.id}'); editEmployee(${emp.id})" style="background: #4f46e5; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.9)'" onmouseup="this.style.transform='scale(1)'">
                            <i class="fas fa-edit" style="pointer-events: none;"></i>
                        </button>
                        <button type="button" class="action-btn" title="Delete" onclick="window.deleteEmployee(${emp.id}, this)" style="background: #ef4444; color: white; padding: 0 10px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.9)'" onmouseup="this.style.transform='scale(1)'">
                            DELETE
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    list.innerHTML = tableHTML;

    const totalEmpsEl = document.getElementById('totalEmps');
    if (totalEmpsEl) totalEmpsEl.innerText = employees.length;

    // --- Draw Graphical Analytics Chart ---
    (async () => {
        try {
            const dpRes = await fetch(`${API_BASE}/departments`);
            const departments = await dpRes.json();
            const deptCounts = {};

            // Pehle saare departments ko 0 set kar dete hain taki sab list me dikhe
            departments.forEach(d => {
                deptCounts[d.name] = 0;
            });
            deptCounts["Unassigned"] = 0;

            // Ab actual employees count karte hain
            employees.forEach(emp => {
                const dName = emp.department ? emp.department.name : "Unassigned";
                if (deptCounts[dName] !== undefined) {
                    deptCounts[dName]++;
                } else {
                    deptCounts[dName] = 1;
                }
            });

            // Agar koi unassigned nahi hai, toh use hata do
            if (deptCounts["Unassigned"] === 0) {
                delete deptCounts["Unassigned"];
            }

            const ctx = document.getElementById('deptChart');
            if (ctx) {
                // Purana chart clear karo taaki naya properly aaye
                if (window.empChartInstance) {
                    window.empChartInstance.destroy();
                }

                // Labels ko thoda aur accha dikhane ke liye (Count ke sath)
                const chartLabels = Object.keys(deptCounts).map(key => `${key} (${deptCounts[key]})`);

                window.empChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            data: Object.values(deptCounts),
                            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#06b6d4', '#ec4899', '#f43f5e', '#14b8a6'],
                            borderWidth: 2,
                            borderColor: '#ffffff',
                            hoverOffset: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: 10
                        },
                        plugins: {
                            legend: {
                                position: 'right', // Dahini taraf list form me dikhane ke liye
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 8,
                                    padding: 15, // Items ke bich aacha gap
                                    font: {
                                        size: 13,
                                        family: "'Inter', sans-serif"
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (e) {
            console.error("Error drawing chart: ", e);
        }
    })();
}

// --- Search / Filter Employees ---
window.filterEmployees = function () {
    const input = document.getElementById("employeeSearchInput").value.toLowerCase();
    const table = document.getElementById("employeeTable");
    const trs = table.getElementsByTagName("tr");

    for (let i = 1; i < trs.length; i++) {
        let textContent = trs[i].textContent || trs[i].innerText;
        if (textContent.toLowerCase().indexOf(input) > -1) {
            trs[i].style.display = "";
        } else {
            trs[i].style.display = "none";
        }
    }
};

// --- Export Employees to CSV ---
window.exportEmployeesCSV = async function () {
    try {
        const res = await fetch(`${API_BASE}/employees`);
        const employees = await res.json();

        let csvContent = "ID,First Name,Last Name,Email,Phone Number,Designation,Department,Salary,Address\n";

        employees.forEach(emp => {
            const deptName = emp.department ? emp.department.name : "N/A";
            const row = [
                emp.id,
                `"${emp.firstName}"`,
                `"${emp.lastName}"`,
                `"${emp.email}"`,
                `"${emp.phoneNumber || ''}"`,
                `"${emp.designation}"`,
                `"${deptName}"`,
                emp.salary || 0,
                `"${emp.address || ''}"`
            ].join(",");
            csvContent += row + "\n";
        });

        // Robust Blob object for downloading
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });

        // IE/Edge specific fallback
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, "Employees_Export.csv");
        } else {
            // Standard HTML5 download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Employees_Export.csv");
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        }

    } catch (err) {
        alert("Error exporting CSV: " + err);
    }
}

document.getElementById('employeeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('empId').value;
    const employeeData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        designation: document.getElementById('designation').value,
        address: document.getElementById('address').value,
        salary: parseFloat(document.getElementById('salary').value),
        department: { id: parseInt(document.getElementById('departmentSelect').value) }
    };

    const formData = new FormData();
    formData.append("employee", JSON.stringify(employeeData));
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append("photo", photoFile);
    }

    const url = id ? `${API_BASE}/employees/${id}` : `${API_BASE}/employees`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            body: method === 'POST' ? formData : JSON.stringify(employeeData),
            headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : {}
        });

        if (res.ok) {
            closeModal();
            loadEmployees();
        } else {
            const err = await res.text();
            alert("Error: " + err);
        }
    } catch (err) {
        console.error(err);
    }
});

// --- Projects & ID Cards ---
async function loadProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();
    const list = document.getElementById('projectList');
    list.innerHTML = '';

    projects.forEach(p => {
        // Calculate Days Taken
        const start = p.startDate ? new Date(p.startDate) : new Date();
        const now = new Date();

        let daysDisplay = "";
        if (p.status === 'COMPLETED') {
            daysDisplay = "Done";
        } else {
            const diffTime = Math.abs(now - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysDisplay = `${diffDays} Days`;
        }

        list.innerHTML += `
            <tr>
                <td style="padding: 1rem;">
                    <strong>${p.title}</strong>
                    <div style="font-size: 0.8rem; color: #777;">Started: ${p.startDate || 'N/A'}</div>
                </td>
                <td>${p.employee ? p.employee.firstName + ' ' + p.employee.lastName : 'Unassigned'}</td>
                <td><span style="color: #f72585; font-weight: 500;">${p.deadline}</span></td>
                <td><span style="font-weight: 600;">${daysDisplay}</span></td>
                <td>
                    <span class="status-badge" style="background: ${getStatusColor(p.status)}; color: white; border-radius: 5px; padding: 5px 10px;">
                        ${p.status}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn" style="background: #06d6a0; color: white;" onclick="updateProjectStatus(${p.id}, 'COMPLETED')">Done</button>
                        <button class="action-btn" style="background: #4361ee; color: white;" onclick="updateProjectStatus(${p.id}, 'IN_PROGRESS')">Work</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// --- Export Projects to CSV ---
window.exportProjectsCSV = async function () {
    try {
        const res = await fetch(`${API_BASE}/projects`);
        const projects = await res.json();

        let csvContent = "Project ID,Project Title,Assigned To,Start Date,Deadline,Status\n";

        projects.forEach((p) => {
            const empName = p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : "Unassigned";
            const startDate = p.startDate || "N/A";

            const row = [
                p.id,
                `"${p.title}"`,
                `"${empName}"`,
                `"${startDate}"`,
                `"${p.deadline}"`,
                `"${p.status}"`
            ].join(",");

            csvContent += row + "\n";
        });

        // Use encodeURIComponent & UTF-8 BOM
        const uri = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);

        const link = document.createElement("a");
        link.href = uri;
        link.download = "Project_Management_Export.csv";
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);

    } catch (err) {
        alert("Error exporting Projects CSV: " + err);
    }
}

async function updateProjectStatus(id, status) {
    try {
        const res = await fetch(`${API_BASE}/projects/${id}/status/${status}`, {
            method: 'PATCH'
        });
        if (res.ok) {
            loadProjects();
        } else {
            const err = await res.text();
            alert("Error: " + err);
        }
    } catch (e) {
        console.error(e);
    }
}

function getStatusColor(status) {
    if (status === 'COMPLETED') return '#06d6a0';
    if (status === 'IN_PROGRESS') return '#ffd166';
    return '#ef476f';
}

async function loadIdCards() {
    const res = await fetch(`${API_BASE}/employees`);
    const employees = await res.json();
    const container = document.getElementById('idCardContainer');
    container.innerHTML = '';

    employees.forEach(emp => {
        container.innerHTML += `
            <div class="id-card" style="position: relative; overflow: hidden; background: white; width: 260px; padding: 0; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; border: 1px solid #e5e7eb; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <!-- ID Card Header -->
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px 15px 40px; color: white;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px;">
                        <div style="background: white; color: #1e3a8a; width: 28px; height: 28px; border-radius: 6px; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <i class="fa-solid fa-n" style="font-weight: 900; font-size: 1rem;"></i>
                        </div>
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Narayana</h4>
                    </div>
                    <div style="font-size: 0.6rem; opacity: 0.85; letter-spacing: 1px; font-weight: 500;">PRIVATE LIMITED</div>
                </div>
                
                <!-- Profile Image -->
                <div style="margin-top: -35px;">
                    <img src="${emp.photoUrl || 'https://via.placeholder.com/100'}" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid white; background: #f8fafc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); object-fit: cover;">
                </div>
                
                <!-- Employee Details -->
                <div style="padding: 10px 20px 20px;">
                    <h3 style="margin: 5px 0 2px; color: #0f172a; font-size: 1.1rem; font-weight: 700;">${emp.firstName} ${emp.lastName}</h3>
                    <p style="color: #6366f1; font-weight: 600; font-size: 0.8rem; margin: 0 0 15px;">${emp.designation}</p>
                    
                    <div style="text-align: left; font-size: 0.75rem; color: #475569; display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 10px 15px; border-radius: 8px;">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <i class="fas fa-id-badge" style="color: #94a3b8; width: 14px; text-align: center;"></i> 
                            <span style="font-weight: 600;">EMP-${emp.id.toString().padStart(4, '0')}</span>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <i class="fas fa-building" style="color: #94a3b8; width: 14px; text-align: center;"></i> 
                            ${emp.department?.name || 'N/A'}
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <i class="fas fa-phone-alt" style="color: #94a3b8; width: 14px; text-align: center;"></i> 
                            ${emp.phoneNumber || 'N/A'}
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f1f5f9; padding: 12px; font-size: 0.65rem; color: #64748b; font-weight: 700; border-top: 1px solid #e2e8f0; letter-spacing: 0.5px;">
                    OFFICIAL ID CARD
                </div>
            </div>
        `;
    });
}

async function loadPerformance() {
    const empRes = await fetch(`${API_BASE}/employees`);
    const employees = await empRes.json();
    const projRes = await fetch(`${API_BASE}/projects`);
    const projects = await projRes.json();

    const list = document.getElementById('performanceList');
    list.innerHTML = '';

    employees.forEach(emp => {
        const empProjects = projects.filter(p => p.employee && p.employee.id === emp.id);
        const completed = empProjects.filter(p => p.status === 'COMPLETED').length;
        const score = empProjects.length === 0 ? 'N/A' : ((completed / empProjects.length) * 5).toFixed(1);

        list.innerHTML += `
            <tr>
                <td>${emp.firstName} ${emp.lastName}</td>
                <td>${completed} / ${empProjects.length}</td>
                <td>
                    <div style="width: 100px; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${empProjects.length === 0 ? 0 : (completed / empProjects.length) * 100}%; height: 100%; background: var(--success);"></div>
                    </div>
                </td>
                <td><strong style="color: var(--primary);">${score} / 5.0</strong></td>
            </tr>
        `;
    });
}

// --- Project Modal Logic ---
function openProjectModal() {
    loadEmployeesForSelect();
    document.getElementById('projectModal').style.display = 'flex';
}

function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
}

async function loadEmployeesForSelect() {
    const res = await fetch(`${API_BASE}/employees`);
    const employees = await res.json();
    const select = document.getElementById('projEmployeeSelect');
    select.innerHTML = '';
    employees.forEach(e => {
        select.innerHTML += `<option value="${e.id}">${e.firstName} ${e.lastName}</option>`;
    });
}

document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('projTitle').value,
        employee: { id: parseInt(document.getElementById('projEmployeeSelect').value) },
        deadline: document.getElementById('projDeadline').value
    };

    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        closeProjectModal();
        loadProjects();
    }
});

// --- Existing Utilities (Refined) ---
async function loadDepartments() {
    const res = await fetch(`${API_BASE}/departments`);
    const departments = await res.json();
    const select = document.getElementById('departmentSelect');
    if (select) {
        select.innerHTML = '';
        departments.forEach(dep => {
            select.innerHTML += `<option value="${dep.id}">${dep.name}</option>`;
        });
    }
}

async function loadDepartmentsList() {
    const res = await fetch(`${API_BASE}/departments`);
    const departments = await res.json();
    const list = document.getElementById('departmentList');
    if (list) {
        list.innerHTML = '';
        departments.forEach((dep, index) => {
            list.innerHTML += `
                <tr>
                    <td style="font-weight: 600; color: var(--primary);">#${index + 1}</td>
                    <td style="font-weight: 600;">${dep.name}</td>
                    <td>${dep.location}</td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="action-btn" title="Edit" onclick="editDepartment(${dep.id})" style="background: #4f46e5; color: white; width: 30px; height: 30px; border-radius: 6px;">
                                <i class="fas fa-edit" style="font-size: 0.8rem;"></i>
                            </button>
                            <button class="action-btn" title="Delete" onclick="window.deleteDepartment(${dep.id}, this)" style="background: #ef4444; color: white; width: 30px; height: 30px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                                <i class="fas fa-trash-alt" style="pointer-events: none;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    const totalDepsEl = document.getElementById('totalDeps');
    if (totalDepsEl) totalDepsEl.innerText = departments.length;
}

async function markEmployeeAttendance(employeeId, status) {
    try {
        console.log(`Marking attendance for Employee ${employeeId} as ${status}`);
        const res = await fetch(`${API_BASE}/attendance/mark/${employeeId}/${status}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            console.log("Attendance marked successfully");
            await loadAttendanceAdmin();
            // Refresh calendar if open for this user and month matches
            if (document.getElementById('attendanceCalendarModal').style.display === 'flex') {
                renderCalendar();
            }
        } else {
            const errText = await res.text();
            alert("Error: " + errText);
        }
    } catch (e) {
        console.error("Network error:", e);
        alert("System error. Check connection.");
    }
}

async function loadAttendanceAdmin() {
    console.log("Loading all employees and attendance...");

    // Fix: Use local date instead of UTC ISO date to match backend LocalDate.now()
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    const todayEl = document.getElementById('todayDate');
    if (todayEl) todayEl.innerText = `Today's Date: ${today}`;

    try {
        // Fetch employees and attendance in parallel
        const [empRes, attRes] = await Promise.all([
            fetch(`${API_BASE}/employees`),
            fetch(`${API_BASE}/attendance/all`)
        ]);

        const employees = await empRes.json();
        const allAttendance = await attRes.json();

        // Filter attendance records that match our local date string
        const todayAttendance = allAttendance.filter(a => a.date === today);

        const list = document.getElementById('attendanceAdminList');
        if (!list) return;
        list.innerHTML = '';

        if (employees.length === 0) {
            list.innerHTML = '<tr><td colspan="4" style="text-align:center;">No employees found</td></tr>';
            return;
        }

        employees.forEach(emp => {
            const userId = emp.user ? emp.user.id : null;
            const record = userId ? todayAttendance.find(a => a.user && a.user.id === userId) : null;
            const status = record ? record.status : 'NOT MARKED';

            const colors = {
                'PRESENT': '#06d6a0',
                'ABSENT': '#f72585',
                'LEAVE': '#ffba08',
                'HALF_DAY': '#4361ee',
                'NOT MARKED': '#8d99ae'
            };
            const statusColor = colors[status] || '#8d99ae';

            let timeHtml = '';
            if (record && record.checkInTime) {
                timeHtml = `<div style="font-size: 0.75rem; color: #64748b; margin-top: 5px; font-weight: 600;"><i class="fas fa-clock" style="margin-right: 4px;"></i> ${record.checkInTime}</div>`;
            }

            list.innerHTML += `
                <tr>
                    <td style="padding: 1.2rem;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${emp.photoUrl || 'https://via.placeholder.com/40'}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #eee;">
                            <div>
                                <strong style="display: block; font-size: 1rem;">${emp.firstName} ${emp.lastName}</strong>
                                <span style="font-size: 0.8rem; color: #777;">ID: ${emp.id}</span>
                            </div>
                        </div>
                    </td>
                    <td><span style="font-weight: 500; color: #444;">${emp.designation}</span></td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="action-btn" title="Present" style="background: #06d6a0; color: white; min-width: 40px; font-weight: 700;" onclick="markEmployeeAttendance(${emp.id}, 'PRESENT')">P</button>
                            <button class="action-btn" title="Half Day" style="background: #4361ee; color: white; min-width: 40px; font-weight: 700;" onclick="markEmployeeAttendance(${emp.id}, 'HALF_DAY')">H</button>
                            <button class="action-btn" title="Absent" style="background: #f72585; color: white; min-width: 40px; font-weight: 700;" onclick="markEmployeeAttendance(${emp.id}, 'ABSENT')">A</button>
                            <button class="action-btn" title="Leave" style="background: #ffba08; color: white; min-width: 40px; font-weight: 700;" onclick="markEmployeeAttendance(${emp.id}, 'LEAVE')">L</button>
                            <button class="action-btn" style="background: #000; color: white; padding: 5px 10px;" onclick="openCalendarModal(${emp.id}, '${emp.firstName} ${emp.lastName}', ${userId})">
                                <i class="fas fa-calendar-alt"></i> History
                            </button>
                        </div>
                    </td>
                    <td style="text-align: center;">
                        <span class="status-badge" style="background: ${statusColor}; color: white; padding: 6px 15px; border-radius: 50px; display: inline-block; min-width: 100px; text-align: center;">${status}</span>
                        ${timeHtml}
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading attendance admin:", err);
    }
}

// --- Export Attendance to CSV ---
window.exportAttendanceCSV = async function () {
    try {
        const [empRes, attRes] = await Promise.all([
            fetch(`${API_BASE}/employees`),
            fetch(`${API_BASE}/attendance/all`)
        ]);

        const employees = await empRes.json();
        const allAttendance = await attRes.json();

        let csvContent = "Employee ID,First Name,Last Name,Designation,Attendance Date,Status,Check-In Time\n";

        allAttendance.forEach((record) => {
            // Find corresponding employee
            const emp = employees.find(e => e.user && e.user.id === (record.user ? record.user.id : -1));
            const empId = emp ? emp.id : "N/A";
            const fName = emp ? emp.firstName : "N/A";
            const lName = emp ? emp.lastName : "N/A";
            const desig = emp ? emp.designation : "N/A";

            const timeStr = record.checkInTime ? record.checkInTime : "Not Logged";

            const row = [
                empId,
                `"${fName}"`,
                `"${lName}"`,
                `"${desig}"`,
                `"${record.date}"`,
                `"${record.status}"`,
                `"${timeStr}"`
            ].join(",");

            csvContent += row + "\n";
        });

        // Use encodeURIComponent to correctly parse all characters & UTF-8 BOM for Excel
        const uri = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);

        const link = document.createElement("a");
        link.href = uri;
        link.download = "Attendance_Master_Report.csv";
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);

    } catch (err) {
        alert("Error exporting Attendance CSV: " + err);
    }
}

// --- Calendar Report Logic ---
let currentViewDate = new Date();
let currentViewUserId = null;
let currentViewEmpName = "";

function openCalendarModal(empId, empName, userId) {
    currentViewUserId = userId;
    currentViewEmpName = empName;
    currentViewDate = new Date();
    document.getElementById('attendanceCalendarModal').style.display = 'flex';
    renderCalendar();
}

function closeCalendarModal() {
    document.getElementById('attendanceCalendarModal').style.display = 'none';
}

function prevMonth() {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    renderCalendar();
}

async function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    // Update Title
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonthDisplay').innerText = `${monthNames[month]} ${year}`;
    document.getElementById('calendarTitle').innerText = `Report: ${currentViewEmpName}`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // Add Weekday Headers
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
        grid.innerHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    // Get stats for this month for this user
    let userAttendance = [];
    if (currentViewUserId) {
        const res = await fetch(`${API_BASE}/attendance/user/${currentViewUserId}`);
        userAttendance = await res.json();
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells before start of month
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div></div>`;
    }

    // Render Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = userAttendance.find(a => a.date === dateStr);
        const status = record ? record.status : null;

        const colors = {
            'PRESENT': '#06d6a0',
            'ABSENT': '#f72585',
            'LEAVE': '#ffba08',
            'HALF_DAY': '#4361ee'
        };
        const color = status ? colors[status] : '#eee';

        // Format checkInTime to hh:mm AM/PM without seconds
        let timeLabel = "";
        if (record && record.checkInTime) {
            try {
                const timeParts = record.checkInTime.split(':');
                if (timeParts.length >= 2) {
                    let hour = parseInt(timeParts[0], 10);
                    let min = timeParts[1];
                    let ampm = hour >= 12 ? 'PM' : 'AM';
                    hour = hour % 12;
                    hour = hour ? hour : 12; // the hour '0' should be '12'
                    timeLabel = `<div style="font-size: 0.6rem; color: #475569; text-align: center; margin-top: 4px; font-weight: 700; letter-spacing: -0.5px;">${hour}:${min} ${ampm}</div>`;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }

        grid.innerHTML += `
            <div class="calendar-day" style="display: flex; flex-direction: column; align-items: center; justify-content: start; padding: 5px;">
                <span class="day-num" style="align-self: flex-start; margin-left: 2px;">${day}</span>
                <div class="day-status" style="background: ${color}; width: 100%; height: 6px; border-radius: 4px; margin-top: 5px;"></div>
                ${timeLabel}
            </div>
        `;
    }
}

function openAddModal() {
    document.getElementById('modalTitle').innerText = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('empId').value = '';
    document.getElementById('employeeModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

async function editEmployee(id) {
    const res = await fetch(`${API_BASE}/employees`);
    const employees = await res.json();
    const emp = employees.find(e => e.id === id);
    document.getElementById('modalTitle').innerText = 'Edit Employee';
    document.getElementById('empId').value = emp.id;
    document.getElementById('firstName').value = emp.firstName;
    document.getElementById('lastName').value = emp.lastName;
    document.getElementById('email').value = emp.email;
    document.getElementById('designation').value = emp.designation;
    document.getElementById('phoneNumber').value = emp.phoneNumber || '';
    document.getElementById('address').value = emp.address || '';
    document.getElementById('salary').value = emp.salary;
    document.getElementById('departmentSelect').value = emp.department ? emp.department.id : '';
    document.getElementById('employeeModal').style.display = 'flex';
}


function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// --- Department Management Functions ---
function openDepartmentModal() {
    document.getElementById('deptModalTitle').innerText = 'Add Department';
    document.getElementById('departmentForm').reset();
    document.getElementById('deptId').value = '';
    document.getElementById('departmentModal').style.display = 'flex';
}

function closeDepartmentModal() {
    document.getElementById('departmentModal').style.display = 'none';
}

async function editDepartment(id) {
    const res = await fetch(`${API_BASE}/departments`);
    const departments = await res.json();
    const dep = departments.find(d => d.id === id);
    if (!dep) return;

    document.getElementById('deptModalTitle').innerText = 'Edit Department';
    document.getElementById('deptId').value = dep.id;
    document.getElementById('deptName').value = dep.name;
    document.getElementById('deptLocation').value = dep.location;
    document.getElementById('departmentModal').style.display = 'flex';
}

window.deleteDepartment = async function (id, btn) {
    if (btn) {
        // Double-click to confirm pattern
        if (btn.innerText !== 'Sure?') {
            btn.innerText = 'Sure?';
            btn.style.width = 'auto';
            btn.style.padding = '0 8px';
            btn.style.background = '#991b1b'; // Darker highlight
            setTimeout(() => { // Auto-reset
                if (btn && btn.innerText === 'Sure?') {
                    btn.innerHTML = '<i class="fas fa-trash-alt" style="pointer-events: none;"></i>';
                    btn.style.width = '30px';
                    btn.style.padding = '0';
                    btn.style.background = '#ef4444';
                }
            }, 3000);
            return;
        }
        btn.innerText = '...';
        btn.style.pointerEvents = 'none';
    }

    try {
        const res = await fetch(`${API_BASE}/departments/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadDepartmentsList();
            loadDepartments(); // To refresh select options in employee modal
        } else {
            const err = await res.text();
            if (btn) { btn.innerText = 'Err'; btn.style.background = '#ef4444'; }
            alert("Error: " + err);
        }
    } catch (e) {
        if (btn) { btn.innerText = 'Err'; btn.style.background = '#ef4444'; }
        alert("Network error while deleting department.");
    }
};

document.getElementById('departmentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('deptId').value;
    const name = document.getElementById('deptName').value;
    const location = document.getElementById('deptLocation').value;

    const department = { name, location };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/departments/${id}` : `${API_BASE}/departments`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(department)
        });

        if (res.ok) {
            alert(id ? "Department Updated!" : "Department Added!");
            closeDepartmentModal();
            loadDepartmentsList();
            loadDepartments(); // Refresh dropdowns
        } else {
            const err = await res.text();
            alert("Error: " + err);
        }
    } catch (e) {
        alert("Failed to save department.");
    }
});

// --- Leave Approval System ---
async function loadLeaves() {
    const res = await fetch(`${API_BASE}/leaves/all`);
    const leaves = await res.json();
    const list = document.getElementById('leavesList');
    if (!list) return;
    list.innerHTML = '';

    leaves.forEach(l => {
        let statusColor = '#8d99ae';
        if (l.status === 'APPROVED') statusColor = '#10b981';
        if (l.status === 'REJECTED') statusColor = '#ef4444';
        if (l.status === 'PENDING') statusColor = '#f59e0b';

        list.innerHTML += `
            <tr>
                <td><strong>${l.user ? l.user.fullName : 'Unknown'}</strong></td>
                <td>${l.startDate}</td>
                <td>${l.endDate}</td>
                <td>${l.reason}</td>
                <td><span class="status-badge" style="background: ${statusColor}; color: white; padding: 4px 10px; border-radius: 4px;">${l.status}</span></td>
                <td>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        ${l.status === 'PENDING' ? `
                            <button class="action-btn" title="Approve" style="background: #10b981; color: white;" onclick="updateLeaveStatus(${l.id}, 'APPROVED')"><i class="fas fa-check"></i></button>
                            <button class="action-btn" title="Reject" style="background: #ef4444; color: white;" onclick="updateLeaveStatus(${l.id}, 'REJECTED')"><i class="fas fa-times"></i></button>
                        ` : '<span style="color: #94a3b8; font-size: 0.9em; margin-right: 5px;"><i class="fas fa-lock"></i> Locked</span>'}
                        <button class="action-btn" title="Delete Leave" style="background: #ef4444; color: white; margin-left: 5px;" onclick="deleteLeaveRequest(${l.id}, this)"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

window.deleteLeaveRequest = async function (id, btn) {
    if (!id) return;

    // In-button double confirmation
    if (btn) {
        if (btn.innerText !== 'Sure?') {
            const oldHtml = btn.innerHTML;
            btn.innerHTML = 'Sure?';
            btn.style.background = '#991b1b';
            setTimeout(() => {
                if (btn && btn.innerHTML === 'Sure?') {
                    btn.innerHTML = oldHtml;
                    btn.style.background = '#ef4444';
                }
            }, 3000);
            return;
        }
        btn.innerHTML = '...';
        btn.style.pointerEvents = 'none';
    }

    try {
        const res = await fetch(`${API_BASE}/leaves/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Leave Deleted Successfully!", 'success');
            loadLeaves();
        } else {
            const errBody = await res.text();
            alert("Error deleting leave request. Reason: " + errBody);
            if (btn) { btn.innerHTML = '<i class="fas fa-trash"></i>'; btn.style.background = '#ef4444'; btn.style.pointerEvents = 'auto'; }
        }
    } catch (e) {
        alert("System error while deleting: " + e);
        if (btn) { btn.innerHTML = '<i class="fas fa-trash"></i>'; btn.style.background = '#ef4444'; btn.style.pointerEvents = 'auto'; }
    }
};

async function updateLeaveStatus(id, status) {
    try {
        const res = await fetch(`${API_BASE}/leaves/${id}/status/${status}`, { method: 'PATCH' });
        if (res.ok) {
            showToast(`Leave ${status}!`, 'success');
            loadLeaves();
        } else {
            alert("Error updating leave.");
        }
    } catch (e) {
        alert("System Error.");
    }
}

async function openLeaveModal() {
    document.getElementById('leaveForm').reset();

    // Populate dropdown with all employees
    const select = document.getElementById('leaveEmployeeId');
    select.innerHTML = '';
    const res = await fetch(`${API_BASE}/employees`);
    const employees = await res.json();
    employees.forEach(emp => {
        if (emp.user) {
            select.innerHTML += `<option value="${emp.user.id}">${emp.firstName} ${emp.lastName}</option>`;
        }
    });

    document.getElementById('leaveModal').style.display = 'flex';
}

function closeLeaveModal() {
    document.getElementById('leaveModal').style.display = 'none';
}

document.getElementById('leaveForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        user: { id: parseInt(document.getElementById('leaveEmployeeId').value) },
        startDate: document.getElementById('leaveStart').value,
        endDate: document.getElementById('leaveEnd').value,
        reason: document.getElementById('leaveReason').value
    };

    try {
        const res = await fetch(`${API_BASE}/leaves/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showToast("Leave Applied Successfully!", 'success');
            closeLeaveModal();
            loadLeaves();
        } else {
            const errBody = await res.text();
            alert("Failed to apply leave. Reason: " + errBody);
        }
    } catch (err) {
        alert("System Error: " + err);
    }
});
