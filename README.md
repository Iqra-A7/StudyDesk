# 🎓 StudyDesk — Student Productivity Dashboard

StudyDesk is a modern React-based student productivity dashboard designed to help students manage subjects, tasks, attendance, and GPA in one clean interface.

Built with React and Recharts, the application focuses on performance, usability, and beautiful UI design while storing all data locally inside the browser using LocalStorage.

---

# ✨ Features

## 📚 Subject Management
- Add and remove subjects
- Store teacher names
- Add subject credits
- Dynamic subject color system
- Organized subject cards

---

## ✅ Task Manager
- Create study tasks
- Set:
  - due dates
  - priorities
  - subject categories
- Mark tasks as completed
- Filter tasks:
  - All
  - Active
  - Completed
- Priority-based sorting
- Overdue task indicators

---

## 📅 Attendance Tracker
- Track:
  - Present
  - Absent
  - Late
- Attendance percentage calculation
- Subject-wise attendance statistics
- Visual attendance analytics
- Filter attendance records by subject

---

## 🎓 GPA Calculator
- Semester-wise GPA management
- Grade point calculation system
- Credit-hour based GPA calculation
- Overall GPA calculation
- Radar chart visualization
- Academic performance indicators

---

## 📊 Analytics Dashboard
Overview section includes:
- Subject statistics
- Task completion progress
- Attendance insights
- Current GPA
- Interactive charts and progress indicators

---

## 🌙 Dark / Light Theme
- Fully custom theme system
- Smooth UI experience
- Dynamic CSS variable injection
- Persistent theme preference

---

## 💾 Local Storage Persistence
All data is automatically saved in the browser using LocalStorage.

This means:
- no backend required
- no database needed
- data remains after page refresh

---

# 🛠 Technologies Used

## Frontend
- React.js
- JavaScript (ES6+)

## Data Visualization
- Recharts

## State Management
- React Hooks
  - useState
  - useEffect
  - useCallback

## Styling
- Inline Styling
- Dynamic CSS Variables
- Custom Theme System

## Browser Storage
- LocalStorage API

---

# 🧠 Core React Concepts Used

This project demonstrates multiple important React concepts:

## Functional Components
All UI sections are built using reusable functional components.

Examples:
- Overview
- Subjects
- Tasks
- Attendance
- GPA

---

## React Hooks

### useState
Used for:
- theme state
- tasks
- attendance
- GPA records
- form handling

### useEffect
Used for:
- LocalStorage syncing
- theme injection
- data persistence

### useCallback
Imported for optimization possibilities.

---

## Component Reusability

Reusable components include:
- Card
- Button
- Input
- Select
- Badge
- SectionTitle

This improves:
- maintainability
- scalability
- clean architecture

---

# 📈 Charts & Data Visualization

The application uses Recharts for analytics visualization.

## Bar Chart
Used for:
- attendance percentage visualization

## Radar Chart
Used for:
- GPA subject performance analysis

---

# 🎨 UI/UX Features

- Modern dashboard layout
- Responsive grid system
- Smooth animations
- Clean typography
- Consistent spacing
- Color-coded indicators
- Interactive elements
- Minimalist design approach

---

# 🔥 Advanced Features

## Dynamic Theme Injection
CSS variables are dynamically injected into the DOM for real-time theme switching.

## Smart GPA Calculation
Automatically calculates:
- semester GPA
- cumulative GPA
- grade points
- academic standing

## Real-Time Progress Tracking
Dashboard updates instantly when data changes.

---

# 📂 Project Structure

```bash
src/
│
├── App.jsx
│
├── Components
│   ├── Overview
│   ├── Subjects
│   ├── Tasks
│   ├── Attendance
│   └── GPA
│
└── Utilities
    ├── LocalStorage Helpers
    ├── Theme System
    └── Constants
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/studydesk.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

---

# 📦 Dependencies

```bash
npm install recharts
```

---

# 📱 Responsive Design

The dashboard is designed to work across:
- Desktop
- Tablet
- Mobile devices

---

# 🔒 Data Privacy

All user data is stored locally in the browser.

No external servers or databases are used.

---

# 🎯 Learning Outcomes

This project helped practice:
- React fundamentals
- Component architecture
- State management
- Data visualization
- Dashboard design
- LocalStorage integration
- UI/UX principles
- Responsive layouts

---

# 🌟 Future Improvements

Possible future features:
- Authentication system
- Cloud database
- Notifications
- Calendar integration
- Pomodoro timer
- Export reports
- Backend API
- Multi-user support


---
# 👨‍💻 Author

## Iqra Parvez

Frontend Developer passionate about building modern web applications and improving UI/UX experiences using React.

### Connect With Me
- GitHub: https://github.com/yourusername
- LinkedIn: https://linkedin.com/in/yourprofile

# 📄 License

This project is open-source and available for learning purposes.
