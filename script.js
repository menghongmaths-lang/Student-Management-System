let studentCount = 3;

// មុខងារផ្លាស់ប្តូរ Role (Teacher vs Student)
function switchRole(role) {
    const teacherDash = document.getElementById('teacherDashboard');
    const studentDash = document.getElementById('studentDashboard');
    const btnTeacher = document.getElementById('btnTeacher');
    const btnStudent = document.getElementById('btnStudent');
    const headerTitle = document.getElementById('headerTitle');
    const headerDesc = document.getElementById('headerDesc');

    if (role === 'teacher') {
        teacherDash.style.display = 'block';
        studentDash.style.display = 'none';
        btnTeacher.classList.add('active');
        btnStudent.classList.remove('active');
        headerTitle.innerText = "ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ និងពិន្ទុសិស្ស (សម្រាប់គ្រូបង្រៀន)";
        headerDesc.innerText = "គ្រប់គ្រង បញ្ចូលពិន្ទុសិស្ស និងគណនាមធ្យមភាគដោយស្វ័យប្រវត្តិ។";
    } else {
        teacherDash.style.display = 'none';
        studentDash.style.display = 'block';
        btnStudent.classList.add('active');
        btnTeacher.classList.remove('active');
        headerTitle.innerText = "ប្រព័ន្ធពិនិត្យមើលពិន្ទុសិក្សា (សម្រាប់សិស្សានុសិស្ស)";
        headerDesc.innerText = "ស្វែងរក និងពិនិត្យមើលលទ្ធផលប្រឡងប្រចាំខែរបស់អ្នក។";
    }
}

// មុខងារបន្ថែមសិស្ស (សម្រាប់គ្រូ)
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('studentName').value;
    const gender = document.getElementById('studentGender').value;
    const sClass = document.getElementById('studentClass').value;
    const math = parseFloat(document.getElementById('mathScore').value);
    const exam = parseFloat(document.getElementById('examScore').value);

    const avg = ((math + exam) / 2).toFixed(1);

    let grade = 'F';
    let badgeClass = 'badge-f';
    if (avg >= 90) { grade = 'A'; badgeClass = 'badge-a'; }
    else if (avg >= 80) { grade = 'B'; badgeClass = 'badge-b'; }
    else if (avg >= 70) { grade = 'C'; badgeClass = 'badge-c'; }

    studentCount++;

    const tbody = document.getElementById('studentTableBody');
    const newRow = `
        <tr>
            <td>${studentCount}</td>
            <td class="st-name">${name}</td>
            <td>${gender}</td>
            <td class="st-class">${sClass}</td>
            <td class="st-math">${math}</td>
            <td class="st-exam">${exam}</td>
            <td class="st-avg">${avg}</td>
            <td><span class="${badgeClass} st-grade">${grade}</span></td>
        </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', newRow);
    document.getElementById('studentForm').reset();
});

// មុខងារស្វែងរកពិន្ទុ (សម្រាប់សិស្ស)
function searchStudentResult() {
    const query = document.getElementById('searchStudentName').value.trim().toLowerCase();
    const rows = document.querySelectorAll('#studentTableBody tr');
    const displayBox = document.getElementById('studentResultDisplay');
    let found = false;

    if (query === "") {
        alert("សូមវាយបញ្ចូលឈ្មោះសិស្សដើម្បីស្វែងរក!");
        return;
    }

    rows.forEach(row => {
        const name = row.querySelector('.st-name').innerText;
        if (name.toLowerCase().includes(query)) {
            document.getElementById('resName').innerText = "លទ្ធផលសិក្សារបស់៖ " + name;
            document.getElementById('resClass').innerText = row.querySelector('.st-class').innerText;
            document.getElementById('resMath').innerText = row.querySelector('.st-math').innerText;
            document.getElementById('resExam').innerText = row.querySelector('.st-exam').innerText;
            document.getElementById('resAvg').innerText = row.querySelector('.st-avg').innerText;
            document.getElementById('resGrade').innerText = row.querySelector('.st-grade').innerText;
            
            displayBox.style.display = 'block';
            found = true;
        }
    });

    if (!found) {
        alert("រកមិនឃើញឈ្មោះសិស្សនេះក្នុងប្រព័ន្ធទេ!");
        displayBox.style.display = 'none';
    }
}
