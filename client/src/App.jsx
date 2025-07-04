import Request from "./Pages/Request";
import Schedule from "./Pages/Schedule";
import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom";
import React, { useContext } from 'react';
import FacultyListView from "./Pages/FacultyListView";
import FacultyLogin from './Pages/FacultyLogin';
import Guide from './Pages/Guide';
import Panel from './Pages/Panel';
import AdminLogin from './Pages/AdminLogin';
import AdminPanelManagement from './Pages/AdminPanelManagement'; 
import { useState } from 'react';
import Dashboard from './Pages/Dashboard';
import Home from "./Pages/HomePage"
import axios from 'axios';
import ForgotPassword from "./Pages/ForgotPassword";
import AdminFacultyCreate from "./Pages/AdminFacultyCreation";

const AuthContext = React.createContext(null);

     const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  const login = (token, userRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    setIsAuthenticated(true);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

// Admin-only Protected Route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, role } = useContext(AuthContext);

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

const App = () => {

  const data1 = [{
    studentName: "John Doe",
    regNo: "S12345",
    course: "Computer Science",
    grade: "A"
  },
  {
    studentName: "Jane Smith",
    regNo: "S12346",
    course: "Electrical Engineering",
    grade: "B+"
  },
  {
    studentName: "Michael Johnson",
    regNo: "S12347",
    course: "Mechanical Engineering",
    grade: "A-"
  }]; // First component data
  const data2 = [ {
    facultyName: "Dr. Robert Wilson",
    empId: "F001",
    department: "Computer Science",
    coursesTaught: 3
  },
  {
    facultyName: "Dr. Sarah Parker",
    empId: "F002",
    department: "Electrical Engineering",
    coursesTaught: 4
  }]; // S


  const facultyData = [
    {
      name: "Faculty 1",
      empId: "EMP001",
      students: [
        {
          name: "John Doe",
          regNo: "2023A01",
          projectType: "AI",
          comments: "Good work",
          approved: null,
        },
        {
          name: "Jane Smith",
          regNo: "2023A02",
          projectType: "ML",
          comments: "Needs revision",
          approved: null,
        },
      ],
    },
    {
      name: "Faculty 2",
      empId: "EMP002",
      students: [
        {
          name: "Alice Johnson",
          regNo: "2023B01",
          projectType: "Web",
          comments: "",
          approved: null,
        },
        {
          name: "Bob Brown",
          regNo: "2023B02",
          projectType: "App",
          comments: "",
          approved: null,
        },
      ],
    },
  ];


  const dummyTeams = [
      {
        id: 1001,
        title: "Smart Health Monitoring System",
        description:
          "A wearable IoT device that monitors vital signs and alerts caregivers in emergencies.",
        students: [
          {
            id: 101,
            name: "Alex Johnson",
            email: "alex.j@university.edu",
            role: "Team Lead",
          },
          {
            id: 102,
            name: "Priya Patel",
            email: "priya.p@university.edu",
            role: "Hardware Engineer",
          },
          {
            id: 103,
            name: "Marcus Chen",
            email: "m.chen@university.edu",
            role: "Software Developer",
          },
        ],
      },
      {
        id: 1002,
        title: "EcoTrack: Sustainable Campus Initiative",
        description:
          "Mobile app for tracking and reducing carbon footprint across university facilities.",
        students: [
          {
            id: 104,
            name: "Sophia Williams",
            email: "s.williams@university.edu",
            role: "Project Manager",
          },
          {
            id: 105,
            name: "Jamal Hassan",
            email: "j.hassan@university.edu",
            role: "UI/UX Designer",
          },
          {
            id: 106,
            name: "Emma Rodriguez",
            email: "e.rodriguez@university.edu",
            role: "Backend Developer",
          },
          {
            id: 107,
            name: "Tyler Smith",
            email: "t.smith@university.edu",
            role: "Data Analyst",
          },
        ],
      },
      {
        id: 1003,
        title: "AR Campus Tour Guide",
        description:
          "Augmented reality application providing interactive tour of campus buildings and history.",
        students: [
          {
            id: 108,
            name: "David Kim",
            email: "d.kim@university.edu",
            role: "AR Developer",
          },
          {
            id: 109,
            name: "Aisha Nkosi",
            email: "a.nkosi@university.edu",
            role: "Content Creator",
          },
          {
            id: 110,
            name: "Liam O'Connor",
            email: "l.oconnor@university.edu",
            role: "3D Modeler",
          },
        ],
      },
      {
        id: 1004,
        title: "StudyBuddy: Collaborative Learning Platform",
        description:
          "Web platform connecting students for virtual study groups and resource sharing.",
        students: [
          {
            id: 111,
            name: "Nina Pham",
            email: "n.pham@university.edu",
            role: "Frontend Developer",
          },
          {
            id: 112,
            name: "Carlos Mendez",
            email: "c.mendez@university.edu",
            role: "Backend Developer",
          },
          {
            id: 113,
            name: "Sarah Al-Farsi",
            email: "s.alfarsi@university.edu",
            role: "UX Researcher",
          },
        ],
      },
    ];
  
    // Sample dummy review data
    const dummyReviews = {
      1001: {
        milestone1: {
          progress: 75,
          comments:
            "Good progress on prototype. The team needs to focus more on battery optimization.",
          date: "2025-01-15",
        },
        milestone2: {
          progress: 85,
          comments:
            "Significant improvement in hardware integration. Software needs more testing.",
          date: "2025-02-10",
        },
      },
      1002: {
        milestone1: {
          progress: 60,
          comments:
            "Initial app design looks promising. Need more focus on data collection methods.",
          date: "2025-01-12",
        },
      },
      1003: {
        milestone1: {
          progress: 80,
          comments:
            "Excellent 3D modeling work. AR implementation progressing well.",
          date: "2025-01-20",
        },
        milestone2: {
          progress: 90,
          comments:
            "Testing on different devices shows good compatibility. Content needs more historical accuracy.",
          date: "2025-02-15",
        },
        final: {
          progress: 95,
          comments:
            "Almost ready for deployment. Final adjustments needed for accessibility features.",
          date: "2025-03-01",
        },
      },
    };
  
    
    // In your GuidePanel component
    const [teams, setTeams] = useState(dummyTeams);
    const [titles, setTitles] = useState(dummyTeams.map((team) => team.title));
    const [reviews, setReviews] = useState(dummyReviews);
  
    const handleReviewSubmit = (teamId, reviewType, reviewData) => {
      setReviews((prev) => ({
        ...prev,
        [teamId]: {
          ...(prev[teamId] || {}),
          [reviewType]: reviewData,
        },
      }));
    };
  
    // const handleAddTeam = (title, students) => {
    //   const trimmedTitle = title.trim();
    //   if (
    //     titles.some(
    //       (existingTitle) =>
    //         existingTitle.toLowerCase() === trimmedTitle.toLowerCase()
    //     )
    //   ) {
    //     alert(
    //       "This project title is already taken. Please choose a different title."
    //     );
    //     return;
    //   }
  
    //   const newTeam = {
    //     id: Date.now(),
    //     title: trimmedTitle,
    //     description: trimmedTitle,
    //     students: students.map((student, index) => ({
    //       ...student,
    //       id: Date.now() + index,
    //     })),
    //   };
  
    //   setTitles([...titles, trimmedTitle]);
    //   setTeams([...teams, newTeam]);
    // };

  return (


    <AuthProvider>
    <BrowserRouter>
    
                <Routes>
                  <Route path="/Home" element={<Home />} />

                     <Route path="/" element={<Navigate to="/Home" replace />} /> 
                              {/* <Route
                                exact
                                path="/Download"
                                element={<Download data1={data1} data2={data2} />}
                              /> */}
                              <Route
                                exact
                                path="/admin/Request"
                                element={<Request facultyData={facultyData} />}
                              />
                              <Route
                                exact
                                path="/admin/createFaculty"
                                element={<AdminFacultyCreate />}
                              />
                              <Route
                                exact
                                path="/admin/createFaculty"
                                element={<AdminFacultyCreate />}
                              />
                               <Route
                                path="/admin/panel-management"
                                element={
                                <AdminRoute>
                                  <AdminPanelManagement />
                                </AdminRoute>
                                }
                              /> 
                              <Route
                                path="/admin/facultylistview-adminGuide"
                                element={
                                <AdminRoute>
                                  <FacultyListView />
                                </AdminRoute>
                                }
                                />
                              <Route
                                exact
                                path="/admin/Schedule"
                                element={<Schedule />}
                              />
                              <Route path="/login" element={<FacultyLogin />} />
                              <Route path="/admin/login" element={<AdminLogin />} />
                              <Route path="/forgot-password" element={<ForgotPassword /> } />
                              

                          <Route
                                path="admin/dashboard"
                                element={
                                <ProtectedRoute>
                                  <Dashboard/>
                                </ProtectedRoute>
                                }
                              />

                              <Route
                                path="/Guide"
                                element={
                                <ProtectedRoute>
                                  <Guide
                                  teams={teams}
                                  reviews={reviews}
                                  onReviewSubmit={handleReviewSubmit}
                                />
                                </ProtectedRoute>
                                }
                              />

                              <Route
                                path="/Panel"
                                element={
                                <ProtectedRoute>
                                  <Panel teams={teams} reviews={reviews} />
                                </ProtectedRoute>
                                }
                              />

                              {/* <Route
                                path="/admin/panel-management"
                                element={
                                <AdminRoute>
                                  <AdminPanelManagement />
                                </AdminRoute>
                                }
                              /> */}

                              {/* <Route path="/" element={<Navigate to="/login" />} /> */}
                            </Routes>
                          </BrowserRouter>
                          </AuthProvider>



  );
};

export default App;
export { AuthContext };