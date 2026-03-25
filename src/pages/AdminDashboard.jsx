import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Search,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Make sure admin is logged in, rough check
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      navigate('/login');
    }

    const stored = localStorage.getItem('complaints');
    if (stored) {
      setComplaints(JSON.parse(stored));
    }
  }, [navigate]);

  const handleStatusChange = (id, newStatus) => {
    const updated = complaints.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    );
    setComplaints(updated);
    localStorage.setItem('complaints', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const filteredComplaints = complaints.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-serif text-gray-900">SmartCMS Admin Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">Administrator</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complaint Management</h2>
            <p className="text-gray-500 mt-1">Review user issues and update their resolution status in real-time.</p>
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by ID, title, category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Issue ID</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Submitted</th>
                  <th className="px-6 py-4 font-medium">Resolution Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredComplaints.length > 0 ? filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                      <p className="text-gray-500 text-xs line-clamp-1 max-w-[250px]">{item.description || 'No description provided.'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select 
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`appearance-none w-40 px-3 py-2 rounded-lg text-sm font-bold border-2 focus:outline-none cursor-pointer transition-colors
                            ${item.status === 'Resolved' ? 'bg-green-50 border-green-200 text-green-700 focus:border-green-400' : ''}
                            ${item.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-400' : ''}
                            ${item.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700 focus:border-amber-400' : ''}
                          `}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg className={`fill-current h-4 w-4 
                            ${item.status === 'Resolved' ? 'text-green-500' : ''}
                            ${item.status === 'In Progress' ? 'text-blue-500' : ''}
                            ${item.status === 'Pending' ? 'text-amber-500' : ''}
                          `} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No complaints found</p>
                        <p className="text-sm">The queue is completely clear.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
