/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Pages (to be created)
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import ResumeBuilder from './pages/ResumeBuilder';
import PortfolioBuilder from './pages/PortfolioBuilder';
import CareerCoach from './pages/CareerCoach';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setOnboarded(userDoc.data().onboardingComplete);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin mb-6" />
        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em]">Initializing Utility Core</p>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route 
          path="/onboarding" 
          element={user ? <Onboarding /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? (onboarded ? <Dashboard /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} 
        />
        <Route 
          path="/resumes/:id?" 
          element={user ? <ResumeBuilder /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/portfolio" 
          element={user ? <PortfolioBuilder /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/coach" 
          element={user ? <CareerCoach /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </Router>
  );
}

