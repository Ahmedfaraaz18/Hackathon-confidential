# Frontend-Backend Integration Guide

## Overview

This guide explains how to integrate your React/Vue frontend with the Node.js backend for the Teacher Attendance System.

## Architecture

```
Frontend (React/Vue)
    ↓
API Requests (HTTP/REST)
    ↓
Backend (Node.js/Express)
    ↓
Database (MongoDB)
```

## Setup Steps

### 1. Environment Configuration

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/teacher-attendance
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Teacher Attendance System
```

### 2. CORS Configuration

The backend already has CORS enabled. Make sure your frontend is allowed:

```javascript
// server.js
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 3. API Service Layer

Create an API service in your frontend:

```javascript
// services/api.js
import axios from 'axios';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### 4. Authentication Service

```javascript
// services/authService.js
import api from './api';

export const authService = {
  login: (email, password, department) =>
    api.post('/auth/login', { email, password, department }),

  register: (email, password, name, role) =>
    api.post('/auth/register', { email, password, name, role }),

  verifyToken: () =>
    api.get('/auth/verify'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
```

### 5. Department Service

```javascript
// services/departmentService.js
import api from './api';

export const departmentService = {
  getAll: () => api.get('/department'),

  getById: (id) => api.get(`/department/${id}`),

  getByCode: (code) => api.get(`/department/code/${code}`),

  create: (data) => api.post('/department', data),

  update: (id, data) => api.put(`/department/${id}`, data),

  regenerateQRCodes: (id) => api.post(`/department/${id}/regenerate-qr`)
};
```

### 6. Faculty Service

```javascript
// services/facultyService.js
import api from './api';

export const facultyService = {
  getByDepartment: (departmentId) =>
    api.get(`/faculty/department/${departmentId}`),

  getById: (id) => api.get(`/faculty/${id}`),

  create: (formData) =>
    api.post('/faculty', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  update: (id, data) => api.put(`/faculty/${id}`, data),

  delete: (id) => api.delete(`/faculty/${id}`)
};
```

### 7. Attendance Service

```javascript
// services/attendanceService.js
import api from './api';

export const attendanceService = {
  createRecord: (data) => api.post('/attendance', data),

  getTodayAttendance: (departmentId) =>
    api.get(`/attendance/today/${departmentId}`),

  getHistory: (query) => api.get('/attendance/history', { params: query }),

  getStats: (departmentId, month, year) =>
    api.get(`/attendance/stats/${departmentId}`, {
      params: { month, year }
    })
};
```

### 8. Announcement Service

```javascript
// services/announcementService.js
import api from './api';

export const announcementService = {
  create: (data) => api.post('/announcement', data),

  getAll: (departmentId) => api.get(`/announcement/${departmentId}`),

  getUnread: (departmentId) =>
    api.get(`/announcement/${departmentId}/unread`),

  markAsRead: (announcementId) =>
    api.post(`/announcement/${announcementId}/read`),

  update: (id, data) => api.put(`/announcement/${id}`, data),

  delete: (id) => api.delete(`/announcement/${id}`),

  getMeetings: (departmentId) =>
    api.get(`/announcement/${departmentId}/meetings`)
};
```

### 9. QR Code Service

```javascript
// services/qrCodeService.js
import api from './api';

export const qrCodeService = {
  getQRCodes: (departmentId) =>
    api.get(`/qr-code/${departmentId}`),

  verifyQRCode: (qrData, departmentCode) =>
    api.post('/qr-code/verify', { qrData, departmentCode }),

  downloadQRCode: (departmentId, type) =>
    api.get(`/qr-code/${departmentId}/download/${type}`, {
      responseType: 'blob'
    })
};
```

### 10. Report Service

```javascript
// services/reportService.js
import api from './api';

export const reportService = {
  getAttendanceReport: (departmentId, startDate, endDate) =>
    api.get('/report/attendance', {
      params: { departmentId, startDate, endDate }
    }),

  exportToCSV: (departmentId, startDate, endDate) =>
    api.get('/report/export-csv', {
      params: { departmentId, startDate, endDate },
      responseType: 'blob'
    }),

  getStatistics: (departmentId, month, year) =>
    api.get(`/report/statistics/${departmentId}`, {
      params: { month, year }
    })
};
```

## Frontend Implementation Examples

### Login Page

```javascript
// pages/Login.vue
import { authService } from '@/services/authService';

export default {
  data() {
    return {
      email: '',
      password: '',
      department: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      try {
        const response = await authService.login(
          this.email,
          this.password,
          this.department
        );
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
```

### Attendance Recording

```javascript
// components/QRScanner.vue
import { attendanceService } from '@/services/attendanceService';

export default {
  methods: {
    async recordAttendance(qrData, type) {
      try {
        const response = await attendanceService.createRecord({
          facultyId: this.facultyId,
          departmentId: this.departmentId,
          qrData: qrData,
          type: type,
          lateReason: this.lateReason,
          lateComment: this.lateComment
        });
        this.$emit('success', response);
      } catch (error) {
        this.$emit('error', error.message);
      }
    }
  }
};
```

### Faculty Management

```javascript
// components/FacultyForm.vue
import { facultyService } from '@/services/facultyService';

export default {
  methods: {
    async saveFaculty() {
      const formData = new FormData();
      formData.append('employeeId', this.faculty.employeeId);
      formData.append('name', this.faculty.name);
      formData.append('email', this.faculty.email);
      formData.append('phone', this.faculty.phone);
      formData.append('department', this.faculty.department);
      formData.append('designation', this.faculty.designation);
      formData.append('subject', this.faculty.subject);
      
      if (this.photoFile) {
        formData.append('photo', this.photoFile);
      }

      try {
        if (this.faculty._id) {
          await facultyService.update(this.faculty._id, formData);
        } else {
          await facultyService.create(formData);
        }
        this.$emit('saved');
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
```

### Announcements

```javascript
// components/AnnouncementBoard.vue
import { announcementService } from '@/services/announcementService';

export default {
  data() {
    return {
      announcements: [],
      unreadCount: 0
    };
  },
  async mounted() {
    await this.loadAnnouncements();
  },
  methods: {
    async loadAnnouncements() {
      try {
        this.announcements = await announcementService.getAll(
          this.departmentId
        );
        const unread = await announcementService.getUnread(
          this.departmentId
        );
        this.unreadCount = unread.count;
      } catch (error) {
        console.error(error);
      }
    },
    async markAsRead(announcementId) {
      await announcementService.markAsRead(announcementId);
      this.unreadCount--;
    }
  }
};
```

## Data Flow Examples

### Check-In Flow

```
1. Teacher clicks "Check In"
   ↓
2. Frontend opens QR scanner
   ↓
3. Teacher scans QR code
   ↓
4. Frontend extracts QR data
   ↓
5. Sends to: POST /api/attendance
   {
     "facultyId": "...",
     "departmentId": "...",
     "qrData": "ATTENDANCE:TYPE=CHECK_IN...",
     "type": "CHECK_IN"
   }
   ↓
6. Backend validates QR code
   ↓
7. Checks current time (9:00-9:15 = On Time, After = Late)
   ↓
8. If Late: Returns attendance record with "Late" status
   ↓
9. Frontend shows late arrival dialog
   ↓
10. Teacher selects reason
    ↓
11. Sends: PUT /api/attendance/{id}
    {
      "lateReason": "Traffic congestion",
      "lateComment": "Heavy traffic on main road"
    }
    ↓
12. Backend updates record
    ↓
13. Frontend shows success message
    ↓
14. Dashboard updates with checked-in status
```

### Announcement Flow

```
1. HOD creates announcement
   ↓
2. Sends: POST /api/announcement
   {
     "title": "...",
     "message": "...",
     "departmentId": "...",
     "recipientType": "all",
     "scheduledMeeting": {...}
   }
   ↓
3. Backend saves announcement
   ↓
4. Teachers' frontends poll: GET /api/announcement/{id}/unread
   ↓
5. Backend returns unread announcements
   ↓
6. Frontend shows notification bell badge
   ↓
7. Teacher clicks bell and views announcements
   ↓
8. Frontend sends: POST /api/announcement/{id}/read
   ↓
9. Backend marks as read
   ↓
10. Badge count decreases
```

## Error Handling

```javascript
// Global error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden - user doesn't have permission
      showError('You do not have permission for this action');
    } else if (status === 404) {
      // Not found
      showError('Resource not found');
    } else if (status === 500) {
      // Server error
      showError('Server error. Please try again later');
    } else {
      // Other errors
      showError(message || 'An error occurred');
    }

    return Promise.reject(error);
  }
);
```

## Testing

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher.cse1@school.edu",
    "password": "teacher123"
  }'
```

### Test Check-In

```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "facultyId": "...",
    "departmentId": "...",
    "qrData": "ATTENDANCE:TYPE=CHECK_IN,DEPT=CSE,TIME_WINDOW=09:00-09:15",
    "type": "CHECK_IN"
  }'
```

## Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
# Build frontend
npm run build

# Deploy to Vercel
vercel deploy
```

### Backend Deployment (Heroku)

```bash
# Login to Heroku
heroku login

# Create app
heroku create teacher-attendance-api

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

## Troubleshooting

### CORS Error

Add frontend URL to backend CORS:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

### Token Expired

Implement refresh token logic:
```javascript
// Try to refresh token on 401
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/refresh',
        { refreshToken }
      );
      localStorage.setItem('token', response.data.token);
      return api.request(error.config);
    } catch (err) {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});
```

## Support

For integration issues, refer to the API documentation or contact support.
