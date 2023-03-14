import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './../pages/Home';
import Dashboard from './../pages/Dashboard';
import Login from './../pages/Login';
import SignUp from './../pages/SignUp';
import PageNotFound from './../pages/PageNotFound';
import Profile from './../pages/Profile';
import Recovery from './../pages/Recovery';
import Reset from './../pages/Reset';
import Samples from './../pages/Samples';
import ForgotPassword from './../pages/ForgotPassword';

import { AnimatePresence } from 'framer-motion';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<Reset />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/dashboard/all" element={<Dashboard />} />
        <Route path="/dashboard/samples" element={<Samples />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/page-not-found" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
