import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Navbar({ title, userRole }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-rose-900 via-red-900 to-rose-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm px-5 py-2.5 rounded-xl border-2 border-white/40 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-widest text-white drop-shadow-lg">L</span>
                <span className="text-xl font-black tracking-widest text-white drop-shadow-lg">B</span>
                <span className="text-xl font-black tracking-widest text-white drop-shadow-lg">R</span>
                <span className="text-xl font-black tracking-widest text-white drop-shadow-lg">S</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{title}</h1>
              <span className="text-white/80 text-xs font-medium">{userRole}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

