// ========== DATA STRUCTURES ==========

const DEPARTMENTS = {
  CSE: { id: 'CSE', name: 'Computer Science & Engineering', color: '#0ea5e9', hodName: 'Dr. Rajesh Kumar', hodEmail: 'hod.cse@school.edu' },
  CIVIL: { id: 'CIVIL', name: 'Civil Engineering', color: '#d97706', hodName: 'Prof. Suresh Kumar', hodEmail: 'hod.civil@school.edu' },
  MECH: { id: 'MECH', name: 'Mechanical Engineering', color: '#6366f1', hodName: 'Dr. Anil Kumar', hodEmail: 'hod.mech@school.edu' },
  ECE: { id: 'ECE', name: 'Electronics & Communication Engineering', color: '#ec4899', hodName: 'Dr. Ramesh Singh', hodEmail: 'hod.ece@school.edu' }
};

const LATE_ARRIVAL_REASONS = [
  'Traffic congestion',
  'Public transport delay',
  'Family emergency',
  'Medical appointment',
  'Vehicle breakdown',
  'Other'
];

const ATTENDANCE_CONFIG = {
  checkInStart: '09:00',
  checkInEnd: '09:15',
  lateAfter: '09:15',
  checkOutTime: '16:10'
};

const users = {
  CSE: {
    hod: { email: 'hod.cse@school.edu', password: 'admin123', name: 'Dr. Rajesh Kumar', role: 'hod', department: 'CSE' },
    faculty: [
      { email: 'teacher.cse1@school.edu', password: 'teacher123', name: 'Amit Singh', employeeId: 'EMP001', department: 'CSE', designation: 'Assistant Professor', subject: 'Data Structures' },
      { email: 'teacher.cse2@school.edu', password: 'teacher123', name: 'Priya Sharma', employeeId: 'EMP002', department: 'CSE', designation: 'Associate Professor', subject: 'Algorithms' },
      { email: 'teacher.cse3@school.edu', password: 'teacher123', name: 'Vikram Patel', employeeId: 'EMP003', department: 'CSE', designation: 'Professor', subject: 'Machine Learning' },
      { email: 'teacher.cse4@school.edu', password: 'teacher123', name: 'Neha Gupta', employeeId: 'EMP004', department: 'CSE', designation: 'Assistant Professor', subject: 'Web Development' },
      { email: 'teacher.cse5@school.edu', password: 'teacher123', name: 'Arjun Verma', employeeId: 'EMP005', department: 'CSE', designation: 'Associate Professor', subject: 'Database Systems' }
    ]
  },
  CIVIL: {
    hod: { email: 'hod.civil@school.edu', password: 'admin123', name: 'Prof. Suresh Kumar', role: 'hod', department: 'CIVIL' },
    faculty: [
      { email: 'teacher.civil1@school.edu', password: 'teacher123', name: 'Ravi Kumar', employeeId: 'EMP006', department: 'CIVIL', designation: 'Professor', subject: 'Structural Engineering' },
      { email: 'teacher.civil2@school.edu', password: 'teacher123', name: 'Kavya Singh', employeeId: 'EMP007', department: 'CIVIL', designation: 'Assistant Professor', subject: 'Construction Management' },
      { email: 'teacher.civil3@school.edu', password: 'teacher123', name: 'Ashok Patel', employeeId: 'EMP008', department: 'CIVIL', designation: 'Associate Professor', subject: 'Hydraulics' }
    ]
  },
  MECH: {
    hod: { email: 'hod.mech@school.edu', password: 'admin123', name: 'Dr. Anil Kumar', role: 'hod', department: 'MECH' },
    faculty: [
      { email: 'teacher.mech1@school.edu', password: 'teacher123', name: 'Suresh Babu', employeeId: 'EMP009', department: 'MECH', designation: 'Professor', subject: 'Thermodynamics' },
      { email: 'teacher.mech2@school.edu', password: 'teacher123', name: 'Lakshmi Sharma', employeeId: 'EMP010', department: 'MECH', designation: 'Assistant Professor', subject: 'Fluid Mechanics' }
    ]
  },
  ECE: {
    hod: { email: 'hod.ece@school.edu', password: 'admin123', name: 'Dr. Ramesh Singh', role: 'hod', department: 'ECE' },
    faculty: [
      { email: 'teacher.ece1@school.edu', password: 'teacher123', name: 'Sandeep Kumar', employeeId: 'EMP011', department: 'ECE', designation: 'Associate Professor', subject: 'Digital Electronics' },
      { email: 'teacher.ece2@school.edu', password: 'teacher123', name: 'Divya Patel', employeeId: 'EMP012', department: 'ECE', designation: 'Assistant Professor', subject: 'Communication Systems' }
    ]
  },
  principal: { email: 'principal@school.edu', password: 'admin123', name: 'Dr. Rajiv Singh', role: 'principal' },
  management: { email: 'management@school.edu', password: 'admin123', name: 'Ms. Deepika Sharma', role: 'management' }
};

let currentUser = null;
let currentDepartment = null;
let facultyData = {};
let pendingCheckInData = null;

let attendanceRecords = [];
let announcements = [
  {
    id: 1,
    title: 'Department Meeting - Monday 10 AM',
    message: 'All faculty members are requested to attend the departmental meeting on Monday at 10:00 AM in Conference Room A to discuss the new curriculum updates.',
    createdBy: 'Dr. Rajesh Kumar',
    department: 'CSE',
    createdDate: new Date('2025-10-31T10:30:00'),
    hasMeeting: true,
    meetingDate: '2025-11-03',
    meetingTime: '10:00',
    meetingLocation: 'Conference Room A',
    readBy: []
  }
];

let currentQRAction = 'in';
let qrStream = null;
let qrScanInterval = null;
let currentFacultyTab = 'present';

// ========== INITIALIZATION ==========

function init() {
  initializeFacultyData();
  initializeSampleAttendance();
  updateDateTime();
  setInterval(updateDateTime, 1000);
  showView('loginView');
  
  // Setup late reason dropdown change handler
  const lateReasonSelect = document.getElementById('lateReasonSelect');
  if (lateReasonSelect) {
    lateReasonSelect.addEventListener('change', function() {
      const otherGroup = document.getElementById('otherReasonGroup');
      if (this.value === 'Other') {
        otherGroup.style.display = 'block';
      } else {
        otherGroup.style.display = 'none';
      }
    });
  }
}

function initializeFacultyData() {
  facultyData = {
    CSE: users.CSE.faculty,
    CIVIL: users.CIVIL.faculty,
    MECH: users.MECH.faculty,
    ECE: users.ECE.faculty
  };
}

function initializeSampleAttendance() {
  const today = new Date().toISOString().split('T')[0];
  
  // Add some sample attendance
  attendanceRecords = [
    {
      id: 1,
      facultyName: 'Amit Singh',
      employeeId: 'EMP001',
      department: 'CSE',
      checkInTime: '08:55 AM',
      checkOutTime: null,
      date: today,
      method: 'QR',
      status: 'Present',
      lateArrivalReason: null
    },
    {
      id: 2,
      facultyName: 'Vikram Patel',
      employeeId: 'EMP003',
      department: 'CSE',
      checkInTime: '09:20 AM',
      checkOutTime: null,
      date: today,
      method: 'QR',
      status: 'Late',
      lateArrivalReason: 'Traffic congestion'
    }
  ];
}

// ========== AUTHENTICATION ==========

function handleLogin(event) {
  event.preventDefault();
  
  const department = document.getElementById('departmentSelect').value;
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  
  // Check for Principal
  if (email === users.principal.email && password === users.principal.password) {
    currentUser = users.principal;
    showPrincipalDashboard();
    showToast(`Welcome, ${currentUser.name}!`, 'success');
    return;
  }
  
  // Check for Management
  if (email === users.management.email && password === users.management.password) {
    currentUser = users.management;
    showManagementDashboard();
    showToast(`Welcome, ${currentUser.name}!`, 'success');
    return;
  }
  
  // Check for HOD
  for (let dept in users) {
    if (dept === 'principal' || dept === 'management') continue;
    if (users[dept].hod.email === email && users[dept].hod.password === password) {
      currentUser = users[dept].hod;
      currentDepartment = dept;
      showHODDashboard();
      showToast(`Welcome, ${currentUser.name}!`, 'success');
      return;
    }
  }
  
  // Check for Faculty/Teacher
  if (!department) {
    showToast('Please select a department', 'error');
    return;
  }
  
  if (!users[department]) {
    showToast('Invalid department', 'error');
    return;
  }
  
  const faculty = users[department].faculty.find(f => f.email === email && f.password === password);
  if (faculty) {
    currentUser = { ...faculty, role: 'teacher' };
    currentDepartment = department;
    showTeacherDashboard();
    showToast(`Welcome, ${currentUser.name}!`, 'success');
    return;
  }
  
  showToast('Invalid credentials', 'error');
}

function logout() {
  currentUser = null;
  currentDepartment = null;
  document.getElementById('loginForm').reset();
  showView('loginView');
  showToast('Logged out successfully', 'success');
}

// ========== TEACHER DASHBOARD ==========

function showTeacherDashboard() {
  showView('teacherDashboard');
  document.getElementById('teacherName').textContent = currentUser.name;
  document.getElementById('teacherDeptName').textContent = DEPARTMENTS[currentDepartment].name;
  updateTeacherStatus();
  updateAnnouncementBadge();
}

function showHODDashboard() {
  showView('hodDashboard');
  document.getElementById('hodName').textContent = currentUser.name;
  document.getElementById('hodDeptDisplay').textContent = DEPARTMENTS[currentDepartment].name;
  generateDepartmentQRCodes();
  updateHODStats();
  renderFacultyGrid();
  renderHODAnnouncements();
}

function showPrincipalDashboard() {
  showView('principalDashboard');
  renderPrincipalDepartmentCards();
  renderAllFacultyForPrincipal();
}

function showManagementDashboard() {
  showView('managementDashboard');
  renderManagementStats();
  renderManagementDepartmentCards();
}

// ========== TEACHER FUNCTIONS ==========

function updateTeacherStatus() {
  const today = new Date().toISOString().split('T')[0];
  const myRecord = attendanceRecords.find(
    r => r.employeeId === currentUser.employeeId && r.date === today
  );
  
  const statusIcon = document.getElementById('teacherStatusIcon');
  const statusValue = document.getElementById('teacherStatus');
  const timeOnCampus = document.getElementById('teacherTimeOnCampus');
  const todayCheckIn = document.getElementById('todayCheckIn');
  
  if (myRecord && myRecord.checkInTime) {
    statusIcon.textContent = myRecord.status === 'Late' ? '⚠️' : '✅';
    statusValue.textContent = myRecord.checkOutTime ? 'Checked Out' : 'Checked In';
    statusValue.style.color = myRecord.status === 'Late' ? '#f59e0b' : '#10b981';
    todayCheckIn.textContent = myRecord.checkInTime;
    
    if (myRecord.status === 'Late') {
      statusValue.textContent = 'LATE ARRIVAL';
    }
    
    if (myRecord.checkOutTime) {
      timeOnCampus.textContent = `Total time: ${calculateTotalTime(myRecord.checkInTime, myRecord.checkOutTime)}`;
    } else {
      const checkInDate = new Date(`${today} ${myRecord.checkInTime}`);
      const now = new Date();
      const diff = Math.floor((now - checkInDate) / 1000 / 60);
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      timeOnCampus.textContent = `Time on campus: ${hours}h ${mins}m`;
    }
  } else {
    statusIcon.textContent = '⏱️';
    statusValue.textContent = 'Not Checked In';
    statusValue.style.color = '';
    timeOnCampus.textContent = '';
    todayCheckIn.textContent = '--:--';
  }
}

function teacherCheckIn() {
  currentQRAction = 'in';
  showQRScanner('in');
}

function teacherCheckOut() {
  currentQRAction = 'out';
  showQRScanner('out');
}

function viewMyRecords() {
  showRecordsView();
  const myRecords = attendanceRecords.filter(r => r.employeeId === currentUser.employeeId);
  renderRecordsTable(myRecords);
}

function viewAnnouncements() {
  toggleAnnouncementModal();
}

function updateAnnouncementBadge() {
  const unreadAnnouncements = announcements.filter(
    a => a.department === currentDepartment && !a.readBy.includes(currentUser.employeeId)
  );
  
  const badge = document.getElementById('announcementBadge');
  if (unreadAnnouncements.length > 0) {
    badge.textContent = unreadAnnouncements.length;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

function toggleAnnouncementModal() {
  const modal = document.getElementById('announcementsModal');
  if (modal.style.display === 'none' || !modal.style.display) {
    modal.style.display = 'flex';
    renderTeacherAnnouncements();
  } else {
    modal.style.display = 'none';
  }
}

function closeAnnouncementModal() {
  document.getElementById('announcementsModal').style.display = 'none';
}

function renderTeacherAnnouncements() {
  const list = document.getElementById('announcementsList');
  const deptAnnouncements = announcements.filter(a => a.department === currentDepartment);
  
  if (deptAnnouncements.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 32px;">No announcements yet.</p>';
    return;
  }
  
  list.innerHTML = deptAnnouncements.map(ann => {
    const isUnread = !ann.readBy.includes(currentUser.employeeId);
    return `
      <div class="announcement-card ${isUnread ? 'unread' : ''} ${ann.hasMeeting ? 'meeting' : ''}">
        <div class="announcement-header">
          <div>
            <div class="announcement-title">${ann.title}</div>
            <div class="announcement-meta">
              ${new Date(ann.createdDate).toLocaleString()} • ${ann.createdBy}
            </div>
          </div>
        </div>
        <div class="announcement-message">${ann.message}</div>
        ${ann.hasMeeting ? `
          <div class="meeting-details">
            <strong>📅 Meeting Scheduled</strong>
            Date: ${ann.meetingDate} at ${ann.meetingTime}<br>
            Location: ${ann.meetingLocation}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  // Mark as read
  deptAnnouncements.forEach(ann => {
    if (!ann.readBy.includes(currentUser.employeeId)) {
      ann.readBy.push(currentUser.employeeId);
    }
  });
  updateAnnouncementBadge();
}

// ========== HOD FUNCTIONS ==========

function generateDepartmentQRCodes() {
  const checkInQR = `ATTENDANCE:TYPE=CHECK_IN,DEPT=${currentDepartment},TIME_WINDOW=${ATTENDANCE_CONFIG.checkInStart}-${ATTENDANCE_CONFIG.checkInEnd}`;
  const checkOutQR = `ATTENDANCE:TYPE=CHECK_OUT,DEPT=${currentDepartment},TIME_WINDOW=${ATTENDANCE_CONFIG.checkOutTime}`;
  
  const checkInContainer = document.getElementById('checkInQRCode');
  const checkOutContainer = document.getElementById('checkOutQRCode');
  
  checkInContainer.innerHTML = '';
  checkOutContainer.innerHTML = '';
  
  if (typeof QRCode !== 'undefined') {
    new QRCode(checkInContainer, {
      text: checkInQR,
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    
    new QRCode(checkOutContainer, {
      text: checkOutQR,
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

function downloadQR(type) {
  const containerId = type === 'checkIn' ? 'checkInQRCode' : 'checkOutQRCode';
  const canvas = document.querySelector(`#${containerId} canvas`);
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDepartment}-${type}-qr-code.png`;
    a.click();
    showToast(`${type === 'checkIn' ? 'Check-In' : 'Check-Out'} QR Code downloaded`, 'success');
  }
}

function printQR(type) {
  const containerId = type === 'checkIn' ? 'checkInQRCode' : 'checkOutQRCode';
  const container = document.getElementById(containerId);
  const title = type === 'checkIn' ? 'Check-In QR Code' : 'Check-Out QR Code';
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>body { text-align: center; font-family: Arial, sans-serif; padding: 40px; } h1 { margin-bottom: 20px; } canvas { margin: 20px auto; display: block; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h1>' + DEPARTMENTS[currentDepartment].name + '</h1>');
  printWindow.document.write('<h2>' + title + '</h2>');
  printWindow.document.write(container.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

function updateHODStats() {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today && r.department === currentDepartment);
  const totalFaculty = facultyData[currentDepartment].length;
  
  const present = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absent = totalFaculty - present;
  const late = todayRecords.filter(r => r.status === 'Late').length;
  
  document.getElementById('presentCount').textContent = present;
  document.getElementById('absentCount').textContent = absent;
  document.getElementById('lateCount').textContent = late;
}

function switchFacultyTab(tab) {
  currentFacultyTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderFacultyGrid();
}

function renderFacultyGrid() {
  const grid = document.getElementById('facultyGrid');
  const today = new Date().toISOString().split('T')[0];
  const faculty = facultyData[currentDepartment];
  
  let filteredFaculty = faculty;
  
  if (currentFacultyTab === 'present') {
    filteredFaculty = faculty.filter(f => {
      const record = attendanceRecords.find(r => r.employeeId === f.employeeId && r.date === today && r.status !== 'Late');
      return record && record.checkInTime;
    });
  } else if (currentFacultyTab === 'absent') {
    filteredFaculty = faculty.filter(f => {
      const record = attendanceRecords.find(r => r.employeeId === f.employeeId && r.date === today);
      return !record || !record.checkInTime;
    });
  } else if (currentFacultyTab === 'late') {
    filteredFaculty = faculty.filter(f => {
      const record = attendanceRecords.find(r => r.employeeId === f.employeeId && r.date === today);
      return record && record.status === 'Late';
    });
  }
  
  if (filteredFaculty.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 32px; grid-column: 1 / -1;">No faculty members found.</p>';
    return;
  }
  
  grid.innerHTML = filteredFaculty.map(f => {
    const record = attendanceRecords.find(r => r.employeeId === f.employeeId && r.date === today);
    let statusClass = 'absent';
    let badgeClass = 'badge-absent';
    let statusText = 'Absent';
    let timeText = 'Not checked in';
    let lateReasonHTML = '';
    
    if (record) {
      if (record.status === 'Present') {
        statusClass = 'present';
        badgeClass = 'badge-present';
        statusText = 'Present';
      } else if (record.status === 'Late') {
        statusClass = 'late';
        badgeClass = 'badge-late';
        statusText = 'Late';
      }
      
      if (record.checkInTime) {
        timeText = `In: ${record.checkInTime}`;
        if (record.checkOutTime) {
          timeText += ` | Out: ${record.checkOutTime}`;
        }
      }
      
      if (record.lateArrivalReason) {
        lateReasonHTML = `<div class="late-reason">Reason: ${record.lateArrivalReason}</div>`;
      }
    }
    
    const photoHTML = f.photo ? `<img src="${f.photo}" class="faculty-photo ${statusClass === 'absent' ? 'absent' : ''}" alt="${f.name}" />` : `<div class="faculty-photo" style="background: var(--color-bg-2); display: flex; align-items: center; justify-content: center; font-size: 2rem;">👤</div>`;
    
    return `
      <div class="faculty-card ${statusClass}">
        ${photoHTML}
        <div class="faculty-info">
          <div class="faculty-name">${f.name}</div>
          <div class="faculty-id">ID: ${f.employeeId}</div>
          <span class="teacher-status-badge ${badgeClass}">${statusText}</span>
          <div class="faculty-meta">
            <div class="faculty-time">${timeText}</div>
            ${lateReasonHTML}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showAddFacultyModal() {
  document.getElementById('addFacultyModal').style.display = 'flex';
  document.getElementById('addFacultyForm').reset();
  document.getElementById('photoPreview').innerHTML = '<div class="photo-placeholder">👤</div>';
}

function closeAddFacultyModal() {
  document.getElementById('addFacultyModal').style.display = 'none';
}

function previewPhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('photoPreview').innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
  }
}

function submitAddFaculty(event) {
  event.preventDefault();
  
  const employeeId = document.getElementById('facultyEmployeeId').value.trim();
  const name = document.getElementById('facultyName').value.trim();
  const email = document.getElementById('facultyEmail').value.trim();
  const phone = document.getElementById('facultyPhone').value.trim();
  const designation = document.getElementById('facultyDesignation').value;
  const subject = document.getElementById('facultySubject').value.trim();
  
  const photoFile = document.getElementById('facultyPhoto').files[0];
  let photo = null;
  
  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      photo = e.target.result;
      saveFaculty();
    };
    reader.readAsDataURL(photoFile);
  } else {
    saveFaculty();
  }
  
  function saveFaculty() {
    const newFaculty = {
      employeeId,
      name,
      email,
      phone,
      department: currentDepartment,
      designation,
      subject,
      photo,
      password: 'teacher123'
    };
    
    facultyData[currentDepartment].push(newFaculty);
    users[currentDepartment].faculty.push(newFaculty);
    
    closeAddFacultyModal();
    renderFacultyGrid();
    updateHODStats();
    showToast('Faculty member added successfully', 'success');
  }
}

function showCreateAnnouncementModal() {
  document.getElementById('createAnnouncementModal').style.display = 'flex';
  document.getElementById('createAnnouncementForm').reset();
  document.getElementById('meetingFields').style.display = 'none';
}

function closeCreateAnnouncementModal() {
  document.getElementById('createAnnouncementModal').style.display = 'none';
}

function toggleMeetingFields() {
  const checkbox = document.getElementById('scheduleMeeting');
  const fields = document.getElementById('meetingFields');
  fields.style.display = checkbox.checked ? 'block' : 'none';
}

function submitAnnouncement(event) {
  event.preventDefault();
  
  const title = document.getElementById('announcementTitle').value.trim();
  const message = document.getElementById('announcementMessage').value.trim();
  const hasMeeting = document.getElementById('scheduleMeeting').checked;
  
  const announcement = {
    id: announcements.length + 1,
    title,
    message,
    createdBy: currentUser.name,
    department: currentDepartment,
    createdDate: new Date(),
    hasMeeting,
    readBy: []
  };
  
  if (hasMeeting) {
    announcement.meetingDate = document.getElementById('meetingDate').value;
    announcement.meetingTime = document.getElementById('meetingTime').value;
    announcement.meetingLocation = document.getElementById('meetingLocation').value;
  }
  
  announcements.push(announcement);
  closeCreateAnnouncementModal();
  renderHODAnnouncements();
  showToast('Announcement created successfully', 'success');
}

function renderHODAnnouncements() {
  const list = document.getElementById('hodAnnouncementsList');
  const deptAnnouncements = announcements.filter(a => a.department === currentDepartment);
  
  if (deptAnnouncements.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 32px;">No announcements yet. Create your first announcement!</p>';
    return;
  }
  
  list.innerHTML = deptAnnouncements.map(ann => `
    <div class="announcement-card ${ann.hasMeeting ? 'meeting' : ''}">
      <div class="announcement-header">
        <div>
          <div class="announcement-title">${ann.title}</div>
          <div class="announcement-meta">
            ${new Date(ann.createdDate).toLocaleString()} • Read by ${ann.readBy.length} faculty
          </div>
        </div>
      </div>
      <div class="announcement-message">${ann.message}</div>
      ${ann.hasMeeting ? `
        <div class="meeting-details">
          <strong>📅 Meeting Scheduled</strong>
          Date: ${ann.meetingDate} at ${ann.meetingTime}<br>
          Location: ${ann.meetingLocation}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// ========== PRINCIPAL FUNCTIONS ==========

function renderPrincipalDepartmentCards() {
  const container = document.getElementById('principalDeptCards');
  const today = new Date().toISOString().split('T')[0];
  
  container.innerHTML = Object.keys(DEPARTMENTS).map(deptId => {
    const dept = DEPARTMENTS[deptId];
    const faculty = facultyData[deptId] || [];
    const todayRecords = attendanceRecords.filter(r => r.date === today && r.department === deptId);
    const present = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const late = todayRecords.filter(r => r.status === 'Late').length;
    
    return `
      <div class="dept-card" style="border-top: 4px solid ${dept.color};">
        <div class="dept-card-header">
          <div class="dept-icon" style="background: ${dept.color}20; color: ${dept.color};">🏫</div>
          <div>
            <div class="dept-card-title">${dept.name}</div>
            <div class="dept-card-hod">HOD: ${dept.hodName}</div>
          </div>
        </div>
        <div class="dept-stats">
          <div class="dept-stat">
            <div class="dept-stat-value">${faculty.length}</div>
            <div class="dept-stat-label">Total</div>
          </div>
          <div class="dept-stat">
            <div class="dept-stat-value" style="color: #10b981;">${present}</div>
            <div class="dept-stat-label">Present</div>
          </div>
          <div class="dept-stat">
            <div class="dept-stat-value" style="color: #f59e0b;">${late}</div>
            <div class="dept-stat-label">Late</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAllFacultyForPrincipal() {
  const grid = document.getElementById('principalFacultyGrid');
  let allFaculty = [];
  
  Object.keys(facultyData).forEach(dept => {
    allFaculty = allFaculty.concat(facultyData[dept]);
  });
  
  renderFacultyGridGeneric(grid, allFaculty);
}

function filterPrincipalFaculty() {
  const deptFilter = document.getElementById('principalDeptFilter').value;
  const grid = document.getElementById('principalFacultyGrid');
  
  let allFaculty = [];
  
  if (deptFilter) {
    allFaculty = facultyData[deptFilter] || [];
  } else {
    Object.keys(facultyData).forEach(dept => {
      allFaculty = allFaculty.concat(facultyData[dept]);
    });
  }
  
  renderFacultyGridGeneric(grid, allFaculty);
}

function renderFacultyGridGeneric(grid, faculty) {
  const today = new Date().toISOString().split('T')[0];
  
  if (faculty.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 32px; grid-column: 1 / -1;">No faculty members found.</p>';
    return;
  }
  
  grid.innerHTML = faculty.map(f => {
    const record = attendanceRecords.find(r => r.employeeId === f.employeeId && r.date === today);
    let statusClass = 'absent';
    let badgeClass = 'badge-absent';
    let statusText = 'Absent';
    let timeText = 'Not checked in';
    
    if (record) {
      if (record.status === 'Present') {
        statusClass = 'present';
        badgeClass = 'badge-present';
        statusText = 'Present';
      } else if (record.status === 'Late') {
        statusClass = 'late';
        badgeClass = 'badge-late';
        statusText = 'Late';
      }
      
      if (record.checkInTime) {
        timeText = `In: ${record.checkInTime}`;
        if (record.checkOutTime) {
          timeText += ` | Out: ${record.checkOutTime}`;
        }
      }
    }
    
    const photoHTML = f.photo ? `<img src="${f.photo}" class="faculty-photo ${statusClass === 'absent' ? 'absent' : ''}" alt="${f.name}" />` : `<div class="faculty-photo" style="background: var(--color-bg-2); display: flex; align-items: center; justify-content: center; font-size: 2rem;">👤</div>`;
    
    return `
      <div class="faculty-card ${statusClass}">
        ${photoHTML}
        <div class="faculty-info">
          <div class="faculty-name">${f.name}</div>
          <div class="faculty-id">ID: ${f.employeeId} • ${DEPARTMENTS[f.department].name}</div>
          <span class="teacher-status-badge ${badgeClass}">${statusText}</span>
          <div class="faculty-meta">
            <div class="faculty-time">${timeText}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ========== MANAGEMENT FUNCTIONS ==========

function renderManagementStats() {
  const container = document.getElementById('managementStats');
  const today = new Date().toISOString().split('T')[0];
  
  let totalFaculty = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  
  Object.keys(facultyData).forEach(dept => {
    const faculty = facultyData[dept];
    totalFaculty += faculty.length;
    
    const todayRecords = attendanceRecords.filter(r => r.date === today && r.department === dept);
    const present = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    totalPresent += present;
    totalLate += todayRecords.filter(r => r.status === 'Late').length;
  });
  
  totalAbsent = totalFaculty - totalPresent;
  
  container.innerHTML = `
    <div class="stat-card stat-total">
      <div class="stat-card-icon">👥</div>
      <div class="stat-card-content">
        <div class="stat-card-value">${totalFaculty}</div>
        <div class="stat-card-label">Total Faculty</div>
      </div>
    </div>
    <div class="stat-card stat-present">
      <div class="stat-card-icon">✅</div>
      <div class="stat-card-content">
        <div class="stat-card-value">${totalPresent}</div>
        <div class="stat-card-label">Present Today</div>
      </div>
    </div>
    <div class="stat-card stat-absent">
      <div class="stat-card-icon">❌</div>
      <div class="stat-card-content">
        <div class="stat-card-value">${totalAbsent}</div>
        <div class="stat-card-label">Absent Today</div>
      </div>
    </div>
    <div class="stat-card stat-late">
      <div class="stat-card-icon">⏰</div>
      <div class="stat-card-content">
        <div class="stat-card-value">${totalLate}</div>
        <div class="stat-card-label">Late Arrivals</div>
      </div>
    </div>
  `;
}

function renderManagementDepartmentCards() {
  renderPrincipalDepartmentCards();
  document.getElementById('managementDeptCards').innerHTML = document.getElementById('principalDeptCards').innerHTML;
}

// ========== QR SCANNING ==========

function showQRScanner(action) {
  currentQRAction = action;
  showView('qrScannerView');
  document.getElementById('scannerTitle').textContent = action === 'in' ? 'Scan Check-In QR Code' : 'Scan Check-Out QR Code';
  startQRScanner();
}

function hideQRScanner() {
  stopQRScanner();
  if (currentUser) {
    if (currentUser.role === 'teacher') {
      showTeacherDashboard();
    } else if (currentUser.role === 'hod') {
      showHODDashboard();
    }
  } else {
    showView('loginView');
  }
}

function startQRScanner() {
  const video = document.getElementById('qrVideo');
  const canvas = document.getElementById('qrCanvas');
  const errorDiv = document.getElementById('cameraError');
  
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => {
    qrStream = stream;
    video.srcObject = stream;
    video.play();
    errorDiv.style.display = 'none';
    
    qrScanInterval = setInterval(() => {
      scanQRCode(video, canvas);
    }, 500);
  })
  .catch(err => {
    console.error('Camera error:', err);
    errorDiv.style.display = 'block';
    errorDiv.textContent = '❌ Unable to access camera. Please grant camera permissions and try again.';
  });
}

function stopQRScanner() {
  if (qrScanInterval) {
    clearInterval(qrScanInterval);
    qrScanInterval = null;
  }
  if (qrStream) {
    qrStream.getTracks().forEach(track => track.stop());
    qrStream = null;
  }
  const video = document.getElementById('qrVideo');
  if (video) {
    video.srcObject = null;
  }
}

function scanQRCode(video, canvas) {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if (typeof jsQR !== 'undefined') {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        processQRCode(code.data);
      }
    }
  }
}

function processQRCode(data) {
  stopQRScanner();
  
  // Parse QR code data
  if (!data.startsWith('ATTENDANCE:')) {
    showToast('Invalid QR code. Please scan a valid attendance QR code.', 'error');
    setTimeout(() => hideQRScanner(), 2000);
    return;
  }
  
  const parts = data.replace('ATTENDANCE:', '').split(',');
  const qrData = {};
  parts.forEach(part => {
    const [key, value] = part.split('=');
    qrData[key] = value;
  });
  
  // Validate department
  if (qrData.DEPT !== currentDepartment) {
    showToast('Wrong department QR code. Please scan your department QR code.', 'error');
    setTimeout(() => hideQRScanner(), 2000);
    return;
  }
  
  // Validate type
  if (qrData.TYPE !== (currentQRAction === 'in' ? 'CHECK_IN' : 'CHECK_OUT')) {
    showToast(`Please scan the ${currentQRAction === 'in' ? 'Check-In' : 'Check-Out'} QR code.`, 'error');
    setTimeout(() => hideQRScanner(), 2000);
    return;
  }
  
  // Process check-in or check-out
  if (currentQRAction === 'in') {
    processCheckIn();
  } else {
    processCheckOut();
  }
}

function processCheckIn() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Check if already checked in
  const existingRecord = attendanceRecords.find(
    r => r.employeeId === currentUser.employeeId && r.date === dateStr
  );
  
  if (existingRecord && existingRecord.checkInTime) {
    showToast('You have already checked in today!', 'error');
    setTimeout(() => showTeacherDashboard(), 2000);
    return;
  }
  
  // Check if late
  const lateAfterTime = ATTENDANCE_CONFIG.lateAfter;
  const isLate = currentTime > lateAfterTime;
  
  if (isLate) {
    // Calculate minutes late
    const lateTime = new Date(`${dateStr} ${lateAfterTime}`);
    const minutesLate = Math.floor((now - lateTime) / 1000 / 60);
    
    // Show late arrival modal
    pendingCheckInData = { timeStr, dateStr, minutesLate };
    showLateArrivalModal(minutesLate);
  } else {
    // On time check-in
    recordCheckIn(timeStr, dateStr, 'Present', null);
  }
}

function showLateArrivalModal(minutesLate) {
  document.getElementById('minutesLate').textContent = minutesLate;
  document.getElementById('lateArrivalModal').style.display = 'flex';
}

function cancelLateArrival() {
  document.getElementById('lateArrivalModal').style.display = 'none';
  pendingCheckInData = null;
  showTeacherDashboard();
}

function submitLateArrival() {
  const reason = document.getElementById('lateReasonSelect').value;
  if (!reason) {
    showToast('Please select a reason', 'error');
    return;
  }
  
  let finalReason = reason;
  if (reason === 'Other') {
    const otherText = document.getElementById('otherReasonText').value.trim();
    if (!otherText) {
      showToast('Please specify the reason', 'error');
      return;
    }
    finalReason = otherText;
  }
  
  const comments = document.getElementById('lateComments').value.trim();
  if (comments) {
    finalReason += ` (${comments})`;
  }
  
  document.getElementById('lateArrivalModal').style.display = 'none';
  recordCheckIn(pendingCheckInData.timeStr, pendingCheckInData.dateStr, 'Late', finalReason);
  pendingCheckInData = null;
}

function recordCheckIn(timeStr, dateStr, status, lateReason) {
  const newRecord = {
    id: attendanceRecords.length + 1,
    facultyName: currentUser.name,
    employeeId: currentUser.employeeId,
    department: currentDepartment,
    checkInTime: timeStr,
    checkOutTime: null,
    date: dateStr,
    method: 'QR',
    status: status,
    lateArrivalReason: lateReason
  };
  
  attendanceRecords.push(newRecord);
  
  if (status === 'Late') {
    showToast(`⚠️ Late check-in recorded at ${timeStr}. Reason: ${lateReason}`, 'success');
  } else {
    showToast(`✅ Checked in successfully at ${timeStr}`, 'success');
  }
  
  setTimeout(() => showTeacherDashboard(), 2000);
}

function processCheckOut() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];
  
  const record = attendanceRecords.find(
    r => r.employeeId === currentUser.employeeId && r.date === dateStr
  );
  
  if (!record || !record.checkInTime) {
    showToast('Please check in first!', 'error');
    setTimeout(() => showTeacherDashboard(), 2000);
    return;
  }
  
  if (record.checkOutTime) {
    showToast('You have already checked out today!', 'error');
    setTimeout(() => showTeacherDashboard(), 2000);
    return;
  }
  
  record.checkOutTime = timeStr;
  record.totalTime = calculateTotalTime(record.checkInTime, timeStr);
  
  showToast(`🚪 Checked out successfully at ${timeStr}`, 'success');
  setTimeout(() => showTeacherDashboard(), 2000);
}

function calculateTotalTime(checkIn, checkOut) {
  const today = new Date().toISOString().split('T')[0];
  const checkInDate = new Date(`${today} ${checkIn}`);
  const checkOutDate = new Date(`${today} ${checkOut}`);
  const diff = Math.floor((checkOutDate - checkInDate) / 1000 / 60);
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins}m`;
}

// Update teacher status
function updateTeacherStatus() {
  const today = new Date().toISOString().split('T')[0];
  const myRecord = attendanceRecords.find(
    r => r.teacherId === currentUser.id && r.date === today
  );
  
  const statusIcon = document.getElementById('teacherStatusIcon');
  const statusValue = document.getElementById('teacherStatus');
  const timeOnCampus = document.getElementById('teacherTimeOnCampus');
  const todayCheckIn = document.getElementById('todayCheckIn');
  
  if (myRecord && myRecord.checkInTime) {
    statusIcon.textContent = '✅';
    statusValue.textContent = myRecord.checkOutTime ? 'Checked Out' : 'Checked In';
    todayCheckIn.textContent = myRecord.checkInTime;
    
    if (myRecord.checkOutTime) {
      timeOnCampus.textContent = `Total time: ${myRecord.totalTime || 'N/A'}`;
    } else {
      // Calculate time since check-in
      const checkInDate = new Date(`${today} ${myRecord.checkInTime}`);
      const now = new Date();
      const diff = Math.floor((now - checkInDate) / 1000 / 60); // minutes
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      timeOnCampus.textContent = `Time on campus: ${hours}h ${mins}m`;
    }
  } else {
    statusIcon.textContent = '⏱️';
    statusValue.textContent = 'Not Checked In';
    timeOnCampus.textContent = '';
    todayCheckIn.textContent = '--:--';
  }
}

// Generate Universal QR Code
function generateUniversalQR() {
  const qrContainer = document.getElementById('universalQRCode');
  qrContainer.innerHTML = '';
  
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrContainer, {
      text: UNIVERSAL_QR_DATA,
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// Download Universal QR
function downloadUniversalQR() {
  const canvas = document.querySelector('#universalQRCode canvas');
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'science-dept-qr-code.png';
    a.click();
    showToast('QR Code downloaded', 'success');
  }
}

// Print Universal QR
function printUniversalQR() {
  const qrSection = document.querySelector('.qr-section');
  const size = document.getElementById('qrSizeSelect').value;
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Print QR Code - ' + size + '</title>');
  printWindow.document.write('<style>body { text-align: center; font-family: Arial, sans-serif; padding: 40px; } h1 { margin-bottom: 20px; } canvas { margin: 20px auto; display: block; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h1>Science Department Check-Point</h1>');
  printWindow.document.write('<p>Scan this QR code to check in/out</p>');
  printWindow.document.write(document.getElementById('universalQRCode').innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

// Update HOD Stats
function updateHODStats() {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);
  
  const present = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absent = todayRecords.filter(r => r.status === 'Absent').length;
  const late = todayRecords.filter(r => r.status === 'Late').length;
  
  document.getElementById('presentCount').textContent = present;
  document.getElementById('absentCount').textContent = absent;
  document.getElementById('lateCount').textContent = late;
}

// Render Teachers Grid
function renderTeachersGrid() {
  const grid = document.getElementById('teachersGrid');
  const today = new Date().toISOString().split('T')[0];
  
  grid.innerHTML = sampleTeachers.map(teacher => {
    const record = attendanceRecords.find(
      r => r.teacherId === teacher.id && r.date === today
    );
    
    let statusClass = 'absent';
    let badgeClass = 'badge-absent';
    let statusText = 'Absent';
    let timeText = 'Not checked in';
    
    if (record) {
      if (record.status === 'Present') {
        statusClass = 'present';
        badgeClass = 'badge-present';
        statusText = 'Present';
      } else if (record.status === 'Late') {
        statusClass = 'late';
        badgeClass = 'badge-late';
        statusText = 'Late';
      }
      
      if (record.checkInTime) {
        timeText = `In: ${record.checkInTime}`;
        if (record.checkOutTime) {
          timeText += ` | Out: ${record.checkOutTime}`;
        }
      }
    }
    
    return `
      <div class="teacher-card ${statusClass}">
        <div class="teacher-card-header">
          <div class="teacher-name">${teacher.name}</div>
          <span class="teacher-status-badge ${badgeClass}">${statusText}</span>
        </div>
        <div class="teacher-time">${timeText}</div>
      </div>
    `;
  }).join('');
}

// Teacher Dashboard Actions
function teacherCheckIn() {
  currentQRAction = 'in';
  showQRScanner('in');
}

function teacherCheckOut() {
  showFaceScanner();
}

function viewMyRecords() {
  showRecordsView();
  // Filter to show only current user's records
  const myRecords = attendanceRecords.filter(r => r.teacherId === currentUser.id);
  renderRecordsTable(myRecords);
}

function showDetailedRecords() {
  showRecordsView();
}

// ========== UTILITY FUNCTIONS ==========

function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Update all date/time displays
  const dateElements = ['currentDate', 'teacherDate', 'hodDate', 'principalDate', 'managementDate'];
  const timeElements = ['currentTime', 'teacherTime', 'hodTime', 'principalTime', 'managementTime'];
  
  dateElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = dateStr;
  });
  
  timeElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = timeStr;
  });
  
  // Update teacher status if on teacher dashboard
  if (currentUser && currentUser.role === 'teacher') {
    updateTeacherStatus();
  }
  
  // Update HOD stats if on HOD dashboard
  if (currentUser && currentUser.role === 'hod') {
    updateHODStats();
  }
}



function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }
}







// ========== RECORDS ==========

function showRecordsView() {
  showView('recordsView');
  renderRecordsTable();
}

function hideRecordsView() {
  if (currentUser) {
    if (currentUser.role === 'teacher') {
      showTeacherDashboard();
    } else if (currentUser.role === 'hod') {
      showHODDashboard();
    } else if (currentUser.role === 'principal') {
      showPrincipalDashboard();
    } else {
      showManagementDashboard();
    }
  } else {
    showView('loginView');
  }
}

function showDetailedRecords() {
  showRecordsView();
}

function renderRecordsTable(filteredRecords = null) {
  const tbody = document.getElementById('recordsTableBody');
  const records = filteredRecords || attendanceRecords;
  
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--color-text-secondary);">No records found</td></tr>';
    return;
  }
  
  tbody.innerHTML = records.map(record => `
    <tr>
      <td>${record.facultyName}</td>
      <td>${record.employeeId}</td>
      <td>${DEPARTMENTS[record.department].name}</td>
      <td>${record.checkInTime || 'N/A'}</td>
      <td>${record.checkOutTime || 'N/A'}</td>
      <td>${new Date(record.date).toLocaleDateString()}</td>
      <td><span class="method-badge method-qr">QR</span></td>
      <td><span class="status-badge ${record.status === 'Late' ? 'status-late' : (record.status === 'Present' ? 'status-present' : 'status-absent')}">${record.status}</span></td>
    </tr>
  `).join('');
}

function filterRecords() {
  const filterDate = document.getElementById('filterDate').value;
  const filterTeacher = document.getElementById('filterTeacher').value.toLowerCase();
  const filterMethod = document.getElementById('filterMethod').value;
  
  let filtered = attendanceRecords;
  
  if (filterDate) {
    filtered = filtered.filter(r => r.date === filterDate);
  }
  
  if (filterTeacher) {
    filtered = filtered.filter(r => 
      r.facultyName.toLowerCase().includes(filterTeacher) ||
      r.employeeId.toLowerCase().includes(filterTeacher)
    );
  }
  
  if (filterMethod) {
    filtered = filtered.filter(r => r.method === filterMethod);
  }
  
  // Filter by department if user is HOD
  if (currentUser && currentUser.role === 'hod') {
    filtered = filtered.filter(r => r.department === currentDepartment);
  }
  
  renderRecordsTable(filtered);
}

function clearFilters() {
  document.getElementById('filterDate').value = '';
  document.getElementById('filterTeacher').value = '';
  document.getElementById('filterMethod').value = '';
  renderRecordsTable();
}

function exportToCSV() {
  const headers = ['Faculty Name', 'Employee ID', 'Department', 'Check-In Time', 'Check-Out Time', 'Date', 'Method', 'Status', 'Late Reason'];
  let records = attendanceRecords;
  
  // Filter by department if HOD
  if (currentUser && currentUser.role === 'hod') {
    records = records.filter(r => r.department === currentDepartment);
  }
  
  const rows = records.map(r => [
    r.facultyName,
    r.employeeId,
    DEPARTMENTS[r.department].name,
    r.checkInTime || 'N/A',
    r.checkOutTime || 'N/A',
    r.date,
    r.method,
    r.status,
    r.lateArrivalReason || 'N/A'
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-records-${currentDepartment || 'all'}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Records exported to CSV', 'success');
}

function exportToPDF() {
  showToast('PDF export coming soon!', 'success');
}

// ========== TOAST NOTIFICATIONS ==========

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ========== INITIALIZATION ==========

window.addEventListener('DOMContentLoaded', init);