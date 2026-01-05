import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import UserReservationForm from "./pages/UserReservationForm";
import UserDashboard from  "./pages/user/UserDashboard";
import UserHistory from "./pages/UserHistory";
import UserNotifications from "./pages/UserNotifications";

import AdminDashboard from "./pages/admin/AdminDashboard";

import AgentCheckinCheckout from "./pages/agent/AgentCheckinCheckout";
import AdminUsers from "./pages/admin/AdminUsers";


export default function App(){
  return(
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/user" element={<UserDashboard/>}/>
        <Route path="/user/reserve" element={<UserReservationForm/>}/>
        <Route path="/user/history" element={<UserHistory/>}/>
        <Route path="/user/notifications" element={<UserNotifications/>}/>

        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/agent/check" element={<AgentCheckinCheckout/>}/>

      </Routes>

    </BrowserRouter>
  );
}
