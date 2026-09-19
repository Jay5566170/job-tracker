import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/jobs";
import AddJob from "./pages/AddJob";
import JobDetails from "./pages/JobDetails";

import Resumes from "./pages/Resumes";
import Matches from "./pages/Matches";


function App() {

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>


        <Route
          path="/"
          element={<Dashboard />}
        />


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        <Route
          path="/jobs"
          element={<Jobs />}
        />


        <Route
          path="/jobs/add"
          element={<AddJob />}
        />


        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />


        <Route
          path="/resumes"
          element={<Resumes />}
        />


        <Route
          path="/matches"
          element={<Matches />}
        />


      </Routes>


    </BrowserRouter>

  );

}


export default App;