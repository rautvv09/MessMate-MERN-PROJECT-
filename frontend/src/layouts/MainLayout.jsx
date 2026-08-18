import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;