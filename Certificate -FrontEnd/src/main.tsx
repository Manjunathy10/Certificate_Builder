import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Login.tsx";
import About from "./pages/About.tsx";
import Services from "./pages/Services.tsx";
import Signup from "./pages/Signup.tsx";
import RootLayout from "./pages/RootLayout.tsx";
import Userlayout from "./pages/users/Userlayout.tsx";
import Userhome from "./pages/users/Userhome.tsx";

import OAuthSuccess from "./pages/OAuthSuccess.tsx";
import AddStudent from "./pages/AddStudent.tsx";
import ImportStudent from "./pages/ImportStudent.tsx";
import StudentList from "./pages/StudentList";
import EditStudent from "./pages/EditStudent";
import ProfileOnboarding from "./pages/ProfileOnboarding.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<App />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="oauth/success" element={<OAuthSuccess />} />
        <Route path="oauth/failure" element={<OAuthSuccess />} />
      </Route>

      <Route path="/dashboard" element={<Userlayout />}>
        <Route index element={<Userhome />} />
        <Route path="profile" element={<ProfileOnboarding />} />

         {/* Students */}
  <Route path="students">
    <Route path="add" element={<AddStudent />} />
    <Route path="import" element={<ImportStudent />} />
    <Route path="list" element={<StudentList />} />
    <Route path="edit/:id" element={<EditStudent />} />
  </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
