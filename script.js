// LocalStorage Keys
const STORAGE_KEY = "csit_portal_students_v3";
const TRASH_KEY = "csit_portal_trash_v3";

// Global Application State
let studentsData = [];
let trashData = [];
let filteredData = [];

// Pagination State
let currentPage = 1;
let pageSize = 10;

// Sorting State
let currentSortColumn = "id";
let sortAscending = true;

// Chart Instances
let courseChartInstance = null;
let gradeChartInstance = null;

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
    loadInitialData();
    initCharts();
    updateUI();
});

// Toast Notification
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// Dark/Light Theme Switch
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    document.getElementById("themeToggleBtn").innerHTML = isDark ? 
        '<i class="fa-solid fa-sun"></i> Light Mode' : 
        '<i class="fa-solid fa-moon"></i> Dark Mode';
}

// Data Loader & Pre-population
function loadInitialData() {
    const localStudents = localStorage.getItem(STORAGE_KEY);
    const localTrash = localStorage.getItem(TRASH_KEY);

    if (localStudents) {
        studentsData = JSON.parse(localStudents);
    } else {
        studentsData = generate70SampleStudents();
        saveToLocalStorage();
    }

    if (localTrash) {
        trashData = JSON.parse(localTrash);
    } else {
        trashData = [];
    }
}

function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studentsData));
    localStorage.setItem(TRASH_KEY, JSON.stringify(trashData));
}

// 70 Realistic Sample Generator
function generate70SampleStudents() {
    const cities = ["Thane", "Kalwa", "Mumbra", "Diva", "Dombivli", "Thakurli", "Kalyan", "Vithalwadi", "Ulhasnagar", "Ambernath", "Badlapur"];
    const courses = ["B.Sc. CS", "B.Tech IT"];
    const sems = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];
    const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+"];
    const firstNames = ["Rahul", "Priya", "Amit", "Aarav", "Neha", "Rohan", "Sanjana", "Vikas", "Pooja", "Aniket", "Shreya", "Kunal", "Tanvi", "Aditya", "Divya", "Siddharth", "Meera", "Yash", "Ishita", "Gaurav"];
    const lastNames = ["Sharma", "Patel", "Verma", "Gupta", "Deshmukh", "Patil", "Joshi", "Kulkarni", "Shinde", "Pawar"];

    let list = [];
    for (let i = 1; i <= 70; i++) {
        let fname = firstNames[(i - 1) % firstNames.length];
        let lname = lastNames[(i - 1) % lastNames.length];
        let course = courses[i % 2];
        let sem = sems[(i - 1) % sems.length];
        let city = cities[(i - 1) % cities.length];
        let cgpaVal = parseFloat((4.0 + ((i * 17) % 60) / 10).toFixed(2));
        if (i === 4) cgpaVal = 9.92; // Class Topper

        let gradeVal = calculateGrade(cgpaVal);

        list.push({
            id: i,
            name: `${fname} ${lname}`,
            gender: (i % 2 === 0) ? "Female" : "Male",
            bloodGroup: bloodGroups[i % bloodGroups.length],
            course: course,
            sem: sem,
            father: `Suresh ${lname}`,
            mother: `Sunita ${lname}`,
            parentContact: `98${Math.floor(10000000 + Math.random() * 9000000)}`,
            studentContact: `91${Math.floor(10000000 + Math.random() * 9000000)}`,
            email: `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@csitportal.edu.in`,
            city: city,
            cgpa: cgpaVal,
            grade: gradeVal
        });
    }
    return list;
}

// Pass / Fail Grade Logic (5 CGPA से कम = F/Fail Grade)
function calculateGrade(cgpa) {
    const val = parseFloat(cgpa);
    if (isNaN(val)) return "F";
    if (val >= 9.5) return "O";
    if (val >= 8.5) return "A+";
    if (val >= 7.5) return "A";
    if (val >= 5.0) return "B+";
    return "F"; // CGPA < 5.0 is Fail (F Grade)
}

// Chart.js Setup (Including Fail / F Grade)
function initCharts() {
    const ctxCourse = document.getElementById("courseChart").getContext("2d");
    courseChartInstance = new Chart(ctxCourse, {
        type: 'doughnut',
        data: {
            labels: ['B.Sc. CS', 'B.Tech IT'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#6366f1', '#14b8a6'],
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxGrade = document.getElementById("gradeChart").getContext("2d");
    gradeChartInstance = new Chart(ctxGrade, {
        type: 'bar',
        data: {
            labels: ['O Grade', 'A+ Grade', 'A Grade', 'B+ Grade', 'F (Fail)'],
            datasets: [{
                label: 'Students Count',
                data: [0, 0, 0, 0, 0],
                backgroundColor: ['#10b981', '#0284c7', '#f59e0b', '#3b82f6', '#ef4444']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function updateCharts() {
    let csCount = studentsData.filter(s => s.course === "B.Sc. CS").length;
    let itCount = studentsData.filter(s => s.course === "B.Tech IT").length;

    courseChartInstance.data.datasets[0].data = [csCount, itCount];
    courseChartInstance.update();

    let oCount = studentsData.filter(s => s.grade === "O").length;
    let aPlusCount = studentsData.filter(s => s.grade === "A+").length;
    let aCount = studentsData.filter(s => s.grade === "A").length;
    let bPlusCount = studentsData.filter(s => s.grade === "B+").length;
    let fCount = studentsData.filter(s => s.grade === "F").length;

    gradeChartInstance.data.datasets[0].data = [oCount, aPlusCount, aCount, bPlusCount, fCount];
    gradeChartInstance.update();
}

// Summary Statistics
function updateStatsCards() {
    document.getElementById("statTotalEnrolled").innerText = studentsData.length;
    document.getElementById("statTrashCount").innerText = trashData.length;
    document.getElementById("trashCountBadge").innerText = trashData.length;

    if (studentsData.length > 0) {
        let topper = studentsData.reduce((prev, curr) => (curr.cgpa > prev.cgpa) ? curr : prev, studentsData[0]);
        document.getElementById("statTopperName").innerText = topper.name;
        document.getElementById("statTopperCgpa").innerText = `CGPA: ${topper.cgpa}`;

        let passed = studentsData.filter(s => s.cgpa >= 5.0).length;
        let passRate = ((passed / studentsData.length) * 100).toFixed(1);
        document.getElementById("statPassRate").innerText = `${passRate}%`;
    } else {
        document.getElementById("statTopperName").innerText = "--";
        document.getElementById("statTopperCgpa").innerText = "CGPA: --";
        document.getElementById("statPassRate").innerText = "0%";
    }
}

// Search & Filters Handler
function handleFilterChange() {
    const searchVal = document.getElementById("searchInput").value.toLowerCase();
    const courseVal = document.getElementById("filterCourse").value;
    const semVal = document.getElementById("filterSem").value;
    const cityVal = document.getElementById("filterCity").value;
    const gradeVal = document.getElementById("filterGrade").value;

    filteredData = studentsData.filter(s => {
        let matchesSearch = s.name.toLowerCase().includes(searchVal) ||
                            s.email.toLowerCase().includes(searchVal) ||
                            s.city.toLowerCase().includes(searchVal) ||
                            s.studentContact.includes(searchVal) ||
                            s.id.toString().includes(searchVal);

        let matchesCourse = courseVal === "" || s.course === courseVal;
        let matchesSem = semVal === "" || s.sem === semVal;
        let matchesCity = cityVal === "" || s.city === cityVal;
        let matchesGrade = gradeVal === "" || s.grade === gradeVal;

        return matchesSearch && matchesCourse && matchesSem && matchesCity && matchesGrade;
    });

    currentPage = 1;
    applySorting();
    renderTable();
}

function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterCourse").value = "";
    document.getElementById("filterSem").value = "";
    document.getElementById("filterCity").value = "";
    document.getElementById("filterGrade").value = "";
    handleFilterChange();
}

// Table Sorting
function sortTable(column) {
    if (currentSortColumn === column) {
        sortAscending = !sortAscending;
    } else {
        currentSortColumn = column;
        sortAscending = true;
    }
    applySorting();
    renderTable();
}

function applySorting() {
    filteredData.sort((a, b) => {
        let valA = a[currentSortColumn];
        let valB = b[currentSortColumn];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
    });
}

// Table Rendering & Pagination
function renderTable() {
    const tbody = document.getElementById("studentTableBody");
    tbody.innerHTML = "";

    let totalRecords = filteredData.length;
    let totalPages = Math.ceil(totalRecords / pageSize) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    let startIdx = (currentPage - 1) * pageSize;
    let endIdx = Math.min(startIdx + pageSize, totalRecords);
    let pageItems = filteredData.slice(startIdx, endIdx);

    pageItems.forEach(s => {
        let gradeClass = s.grade.toLowerCase().replace('+', '-plus');

        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${s.id}</td>
            <td>
                <div class="student-name">${s.name}</div>
                <div class="student-sub">G: ${s.gender} | BG: ${s.bloodGroup}</div>
            </td>
            <td><span class="badge-course">${s.course} (${s.sem})</span></td>
            <td>
                <div><strong>F:</strong> ${s.father}</div>
                <div class="student-sub"><strong>M:</strong> ${s.mother}</div>
            </td>
            <td>
                <div><i class="fa-solid fa-phone"></i> S: ${s.studentContact}</div>
                <div class="student-sub"><i class="fa-solid fa-phone-flip"></i> P: ${s.parentContact}</div>
                <div class="student-sub"><i class="fa-regular fa-envelope"></i> ${s.email}</div>
            </td>
            <td><strong>${s.city}</strong></td>
            <td><strong>${s.cgpa}</strong></td>
            <td><span class="badge-grade ${gradeClass}">${s.grade}</span></td>
            <td class="actions-cell">
                <i class="fa-regular fa-pen-to-square" onclick="editStudent(${s.id})" title="Edit"></i>
                <i class="fa-regular fa-trash-can" onclick="moveToTrash(${s.id})" title="Move to Trash"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("paginationInfo").innerText = `Showing ${totalRecords === 0 ? 0 : startIdx + 1} to ${endIdx} of ${totalRecords} records`;
    document.getElementById("currentPageNum").innerText = currentPage;
    document.getElementById("btnPrevPage").disabled = (currentPage === 1);
    document.getElementById("btnNextPage").disabled = (currentPage === totalPages || totalRecords === 0);
}

function prevPage() { if (currentPage > 1) { currentPage--; renderTable(); } }
function nextPage() { currentPage++; renderTable(); }
function changePageSize() {
    pageSize = parseInt(document.getElementById("pageSizeSelect").value);
    currentPage = 1;
    renderTable();
}

// Master UI Refresher
function updateUI() {
    handleFilterChange();
    updateStatsCards();
    updateCharts();
}

// CRUD Form Modal Actions
function openStudentModal() {
    document.getElementById("studentForm").reset();
    document.getElementById("editStudentId").value = "";
    document.getElementById("modalTitle").innerHTML = '<i class="fa-solid fa-user-plus"></i> Add New Student';
    document.getElementById("studentModal").style.display = "flex";
}

function closeStudentModal() {
    document.getElementById("studentModal").style.display = "none";
}

function editStudent(id) {
    let student = studentsData.find(s => s.id === id);
    if (!student) return;

    document.getElementById("editStudentId").value = student.id;
    document.getElementById("inpName").value = student.name;
    document.getElementById("inpGender").value = student.gender;
    document.getElementById("inpBloodGroup").value = student.bloodGroup;
    document.getElementById("inpCourseName").value = student.course;
    document.getElementById("inpSemester").value = student.sem;
    document.getElementById("inpFather").value = student.father;
    document.getElementById("inpMother").value = student.mother;
    document.getElementById("inpParentContact").value = student.parentContact;
    document.getElementById("inpStudentContact").value = student.studentContact;
    document.getElementById("inpEmail").value = student.email;
    document.getElementById("inpCity").value = student.city;
    document.getElementById("inpCGPA").value = student.cgpa;

    document.getElementById("modalTitle").innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Edit Student Record';
    document.getElementById("studentModal").style.display = "flex";
}

// Form Submission with CGPA Grade Trigger
function handleFormSubmit(e) {
    e.preventDefault();
    let editId = document.getElementById("editStudentId").value;
    let cgpaParsed = parseFloat(document.getElementById("inpCGPA").value);
    let calculatedGrade = calculateGrade(cgpaParsed);

    let payload = {
        name: document.getElementById("inpName").value,
        gender: document.getElementById("inpGender").value,
        bloodGroup: document.getElementById("inpBloodGroup").value,
        course: document.getElementById("inpCourseName").value,
        sem: document.getElementById("inpSemester").value,
        father: document.getElementById("inpFather").value,
        mother: document.getElementById("inpMother").value,
        parentContact: document.getElementById("inpParentContact").value,
        studentContact: document.getElementById("inpStudentContact").value,
        email: document.getElementById("inpEmail").value,
        city: document.getElementById("inpCity").value,
        cgpa: cgpaParsed,
        grade: calculatedGrade
    };

    if (editId) {
        let index = studentsData.findIndex(s => s.id == editId);
        if (index !== -1) {
            studentsData[index] = { id: parseInt(editId), ...payload };
            showToast("Student record updated successfully!");
        }
    } else {
        let newId = studentsData.length ? Math.max(...studentsData.map(s => s.id)) + 1 : 1;
        studentsData.unshift({ id: newId, ...payload });
        showToast("New student added successfully!");
    }

    saveToLocalStorage();
    closeStudentModal();
    updateUI();
}

// Trash Bin Functions
function moveToTrash(id) {
    let index = studentsData.findIndex(s => s.id === id);
    if (index !== -1) {
        let deletedItem = studentsData.splice(index, 1)[0];
        trashData.push(deletedItem);
        saveToLocalStorage();
        showToast("Record moved to trash!");
        updateUI();
    }
}

function restoreFromTrash(id) {
    let index = trashData.findIndex(s => s.id === id);
    if (index !== -1) {
        let restoredItem = trashData.splice(index, 1)[0];
        studentsData.push(restoredItem);
        saveToLocalStorage();
        showToast("Record restored successfully!");
        renderTrashTable();
        updateUI();
    }
}

function permanentDelete(id) {
    if (confirm("Are you sure? This action cannot be undone.")) {
        trashData = trashData.filter(s => s.id !== id);
        saveToLocalStorage();
        showToast("Permanently deleted!");
        renderTrashTable();
        updateUI();
    }
}

function openTrashModal() {
    renderTrashTable();
    document.getElementById("trashModal").style.display = "flex";
}

function closeTrashModal() {
    document.getElementById("trashModal").style.display = "none";
}

function renderTrashTable() {
    const tbody = document.getElementById("trashTableBody");
    tbody.innerHTML = "";

    trashData.forEach(s => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${s.id}</td>
            <td>${s.name}</td>
            <td>${s.course} (${s.sem})</td>
            <td>${s.city}</td>
            <td>
                <button class="btn-submit" style="padding: 4px 8px; font-size: 11px;" onclick="restoreFromTrash(${s.id})">Restore</button>
                <button class="btn-cancel" style="padding: 4px 8px; font-size: 11px; background: #ef4444; color: white;" onclick="permanentDelete(${s.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// File Exports
function exportToExcel() {
    const exportFormat = filteredData.map(s => ({
        "ID": s.id, "Name": s.name, "Gender": s.gender, "Blood Group": s.bloodGroup,
        "Course": s.course, "Semester": s.sem, "Father Name": s.father, "Mother Name": s.mother,
        "Parent Phone": s.parentContact, "Student Phone": s.studentContact,
        "Email": s.email, "City": s.city, "CGPA": s.cgpa, "Grade": s.grade
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportFormat);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "CSIT_Students_Export.xlsx");
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Gender,Course,Sem,City,CGPA,Grade\n";
    filteredData.forEach(s => {
        csvContent += `${s.id},"${s.name}",${s.gender},"${s.course}",${s.sem},"${s.city}",${s.cgpa},${s.grade}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CSIT_Students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}