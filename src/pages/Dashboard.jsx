import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  MessageCircle,
  X,
  ArrowRight,
  ClipboardList,
  Paperclip
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [complaints, setComplaints] = useState([]);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePic, setProfilePic] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const currentRole = localStorage.getItem('role') || 'user';

  const handleUpdateComplaint = (id, updates) => {
    const updatedIndex = complaints.findIndex(c => c.id === id);
    if (updatedIndex === -1) return;

    const newComplaints = [...complaints];
    newComplaints[updatedIndex] = { ...newComplaints[updatedIndex], ...updates };

    setComplaints(newComplaints);
    localStorage.setItem('complaints', JSON.stringify(newComplaints));

    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(newComplaints[updatedIndex]);
    }
  };

  const handleDeleteComplaint = (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      const newComplaints = complaints.filter(c => c.id !== id);
      setComplaints(newComplaints);
      localStorage.setItem('complaints', JSON.stringify(newComplaints));
      setSelectedComplaint(null);
    }
  };

  const [replyText, setReplyText] = useState('');
  const [replyAttachment, setReplyAttachment] = useState(null);

  const handleReplyFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('File too large (max 4MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyAttachment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!replyText.trim() && !replyAttachment) || !selectedComplaint) return;

    const newMessage = {
      sender: currentRole,
      text: replyText,
      attachment: replyAttachment,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...(selectedComplaint.messages || [])];
    if (selectedComplaint.adminReply && updatedMessages.length === 0) {
      updatedMessages.push({ sender: 'admin', text: selectedComplaint.adminReply, date: 'Legacy' });
    }
    updatedMessages.push(newMessage);

    handleUpdateComplaint(selectedComplaint.id, { messages: updatedMessages, adminReply: null });
    setReplyText('');
    setReplyAttachment(null);
  };

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Hello! I am the SmartCMS AI assistant. How can I help you today?' }
  ]);

  const roleSuffix = currentRole === 'admin' ? '_admin' : '';

  useEffect(() => {
    const savedName = localStorage.getItem(`fullName${roleSuffix}`) || localStorage.getItem('username') || 'Jane Doe';
    setFullName(savedName);

    const savedPhone = localStorage.getItem(`phoneNumber${roleSuffix}`) || '+1 (555) 000-0000';
    setPhoneNumber(savedPhone);

    const savedPic = localStorage.getItem(`profilePic${roleSuffix}`) || '';
    setProfilePic(savedPic);

    const stored = localStorage.getItem('complaints');
    if (stored) {
      setComplaints(JSON.parse(stored));
    } else {
      const defaultComplaints = [
        { id: 'CMP001', title: 'Street light not working', category: 'Infrastructure', priority: 'High', status: 'Pending', date: '2026-03-24' },
        { id: 'CMP002', title: 'Water Supply Issue', category: 'Utility', priority: 'Critical', status: 'In Progress', date: '2026-03-23' },
      ];
      localStorage.setItem('complaints', JSON.stringify(defaultComplaints));
      setComplaints(defaultComplaints);
    }
  }, []);



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(`fullName${roleSuffix}`, fullName);
    localStorage.setItem(`phoneNumber${roleSuffix}`, phoneNumber);
    if (profilePic) {
      localStorage.setItem(`profilePic${roleSuffix}`, profilePic);
    }
    if (currentRole !== 'admin') localStorage.setItem('username', fullName);
    alert('Profile updated successfully!');
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    const newHistory = [...chatHistory, { sender: 'user', text: userMessage }];
    setChatHistory(newHistory);
    setChatMessage('');

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyA4waitZonNcs9BTqUzShYEID5TXDzMwYU"
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "You are the SmartCMS Assistant, a friendly, crisp, and very concise AI chatbot for a Smart Complaint Management System. Answer briefly and politely. Help users with filing complaints, checking status, giving tips on community issues (infrastructure, utilities, security), and accessing emergency contacts. Do not output markdown, just plain text."
              }]
            },
            contents: [{ parts: [{ text: userMessage }] }]
          })
        }
      );

      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

      setChatHistory([
        ...newHistory,
        { sender: 'bot', text: botText }
      ]);
    } catch (error) {
      console.error(error);
      setChatHistory([
        ...newHistory,
        { sender: 'bot', text: "Technical difficulties. Please try again later." }
      ]);
    }
  };

  // Chart Data Processing
  const chartDataRaw = complaints.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = { date: curr.date, filed: 0, responded: 0 };
    acc[curr.date].filed += 1;
    if (curr.status === 'Resolved') acc[curr.date].responded += 1;
    return acc;
  }, {});
  const dataPoints = Object.values(chartDataRaw).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (dataPoints.length < 4) {
    dataPoints.unshift({ date: '2026-03-22', filed: 4, responded: 3 });
    dataPoints.unshift({ date: '2026-03-21', filed: 2, responded: 2 });
    dataPoints.unshift({ date: '2026-03-20', filed: 5, responded: 4 });
  }

  const maxVal = Math.max(...dataPoints.map(d => d.filed), 5);
  const chartHeight = 220;
  const chartWidth = 700;
  const padding = 30;

  const getPoint = (val, index, total) => {
    const x = padding + (index * ((chartWidth - 2 * padding) / (total - 1 || 1)));
    const y = chartHeight - padding - (val / maxVal) * (chartHeight - 2 * padding);
    return `${x},${y}`;
  };

  const filedPoints = dataPoints.map((d, i) => getPoint(d.filed, i, dataPoints.length)).join(' ');
  const respondedPoints = dataPoints.map((d, i) => getPoint(d.responded, i, dataPoints.length)).join(' ');

  const stats = [
    { label: 'Pending', value: complaints.filter(c => c.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold font-serif text-indigo-600">SmartCMS</h1>
        </div>
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3 shrink-0" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'complaints' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {currentRole === 'admin' ? <LayoutDashboard className="w-5 h-5 mr-3 shrink-0" /> : <FileText className="w-5 h-5 mr-3 shrink-0" />}
              {currentRole === 'admin' ? 'Complaint Board' : 'My Complaints'}
            </button>

            <button
              onClick={() => navigate('/emergency')}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-rose-600 hover:bg-rose-50 mt-1"
            >
              <Shield className="w-5 h-5 mr-3 shrink-0" /> Emergency
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Settings className="w-5 h-5 mr-3 shrink-0" /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{activeTab === 'complaints' ? (currentRole === 'admin' ? 'Complaint Board' : 'My Complaints') : activeTab}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/submit-complaint')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm shadow-indigo-200">
              <PlusCircle className="w-4 h-4" /> New Complaint
            </button>
            <div className="flex items-center gap-2">
              <img src={profilePic || `https://ui-avatars.com/api/?name=${fullName}&background=6366f1&color=fff`} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Point Graph Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-indigo-500" />
                  Complaints Point Graph
                </h3>
                <div className="relative w-full overflow-x-auto text-sm">
                  <div className="flex justify-end gap-6 mb-4">
                    <div className="flex items-center gap-2 font-medium text-gray-600"><div className="w-3 h-3 bg-indigo-500 rounded-full shadow-sm"></div>Filed</div>
                    <div className="flex items-center gap-2 font-medium text-gray-600"><div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>Responded</div>
                  </div>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[600px] border-b-2 border-l-2 border-gray-100" preserveAspectRatio="none">
                    <polyline fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={filedPoints} />
                    <polyline fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={respondedPoints} />
                    {dataPoints.map((d, i) => {
                      const [fx, fy] = getPoint(d.filed, i, dataPoints.length).split(',');
                      const [rx, ry] = getPoint(d.responded, i, dataPoints.length).split(',');
                      return (
                        <g key={i}>
                          <circle cx={fx} cy={fy} r="6" fill="#fff" stroke="#6366f1" strokeWidth="2" className="hover:r-[8px] transition-all cursor-pointer">
                            <title>Filed: {d.filed}</title>
                          </circle>
                          <circle cx={rx} cy={ry} r="6" fill="#fff" stroke="#22c55e" strokeWidth="2" className="hover:r-[8px] transition-all cursor-pointer">
                            <title>Responded: {d.responded}</title>
                          </circle>
                          <text x={fx} y={chartHeight - 10} fontSize="11" fill="#9ca3af" textAnchor="middle" fontWeight="500">{d.date.slice(5)}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Creative Ideas Section */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-8">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">💡 Creative Ideas & Suggestions</h3>
                <p className="text-indigo-100 mb-4 opacity-90">Got an out-of-the-box idea to improve our community? We would love to hear it!</p>
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                  <p className="text-sm italic">"Let's implement a neighborhood carpooling feature in the app to reduce traffic on main roads during peak hours." - Community Member</p>
                </div>
              </div>

              {/* History of Complaints Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">History of Complaints</h3>
                  <button onClick={() => setActiveTab('complaints')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm">
                        <th className="px-6 py-4 font-medium">ID</th>
                        <th className="px-6 py-4 font-medium">Title</th>
                        <th className="px-6 py-4 font-medium">Category</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {complaints.slice(0, 5).map((item, idx) => (
                        <tr key={idx} onClick={() => setSelectedComplaint(item)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                          <td className="px-6 py-4">{item.title}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                              ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' : ''}
                              ${item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}
                              ${item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                            `}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{item.date}</td>
                        </tr>
                      ))}
                      {complaints.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No complaints found. Create one to get started!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && currentRole === 'admin' && (
            <div className="animate-in fade-in duration-500 h-full flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Admin Display Board</h3>
              </div>
              <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {['Pending', 'In Progress', 'Resolved'].map(statusCol => (
                  <div key={statusCol} className="flex-1 min-w-[320px] bg-gray-100/60 rounded-2xl p-4 flex flex-col border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex justify-between items-center">
                      {statusCol}
                      <span className="bg-white text-gray-500 px-2 py-0.5 rounded-full text-xs shadow-sm border border-gray-100">
                        {complaints.filter(c => c.status === statusCol).length}
                      </span>
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                      {complaints.filter(c => c.status === statusCol).map((item, idx) => (
                        <div key={idx} onClick={() => setSelectedComplaint(item)} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group">
                          <span className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold mb-3 inline-block border border-gray-100">{item.category}</span>
                          <h5 className="font-bold text-gray-900 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h5>
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{item.description || 'No description provided.'}</p>
                          <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                            <span>#{item.id}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.date}</span>
                          </div>
                        </div>
                      ))}
                      {complaints.filter(c => c.status === statusCol).length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                          No tickets here
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'complaints' && currentRole !== 'admin' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">All My Complaints</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((item, idx) => (
                  <div key={idx} onClick={() => setSelectedComplaint(item)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{item.category}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                              ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' : ''}
                              ${item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}
                              ${item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                            `}>
                        {item.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description || 'No detailed description provided.'}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                      <span className="font-medium text-gray-700">#{item.id}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                    No complaints found.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl animate-in fade-in duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center gap-6">
                  <div className="relative group">
                    <img src={profilePic || `https://ui-avatars.com/api/?name=${fullName}&background=6366f1&color=fff&size=100`} alt="profile" className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-sm object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <span className="text-xs font-semibold text-white">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{fullName}</h3>
                    <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail className="w-4 h-4" /> {fullName ? fullName.toLowerCase().replace(/\s+/g, '') : 'user'}@example.com</p>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <section>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5 text-indigo-500" /> Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                  </section>

                  <section className="pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" /> Account Security</h4>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">Change Password</button>
                    </div>
                  </section>

                  <div className="pt-6 flex justify-end">
                    <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <span className="text-sm text-gray-500 font-medium">Title</span>
                <p className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 font-medium">Complaint ID</span>
                  <p className="font-medium text-gray-900">{selectedComplaint.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 font-medium">Date Submitted</span>
                  <p className="font-medium text-gray-900">{selectedComplaint.date}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 font-medium">Category</span>
                  <p className="font-medium text-gray-900">{selectedComplaint.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 font-medium">Status</span>
                  {currentRole === 'admin' ? (
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => handleUpdateComplaint(selectedComplaint.id, { status: e.target.value })}
                      className={`mt-1 block appearance-none w-full px-3 py-1.5 rounded-lg text-xs font-bold border-2 focus:outline-none cursor-pointer transition-colors
                            ${selectedComplaint.status === 'Resolved' ? 'bg-green-50 border-green-200 text-green-700 focus:border-green-400' : ''}
                            ${selectedComplaint.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-400' : ''}
                            ${selectedComplaint.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700 focus:border-amber-400' : ''}
                        `}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  ) : (
                    <p className="font-medium text-gray-900 mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${selectedComplaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : ''}
                        ${selectedComplaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}
                        ${selectedComplaint.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                      `}>
                        {selectedComplaint.status}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-medium border-t border-gray-100 pt-4 block mt-4">Detailed Description</span>
                <div className="bg-gray-50 p-4 rounded-xl mt-2 text-gray-700 text-sm leading-relaxed">
                  {selectedComplaint.description || "No detailed description provided by the user."}
                </div>
              </div>

              {selectedComplaint.attachment && (
                <div>
                  <span className="text-sm text-gray-500 font-medium border-t border-gray-100 pt-4 block mt-4">Attached Proof</span>
                  <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden inline-block max-w-full">
                    {selectedComplaint.attachment.startsWith('data:image') ? (
                      <a href={selectedComplaint.attachment} target="_blank" rel="noopener noreferrer">
                        <img src={selectedComplaint.attachment} alt="Attachment Proof" className="max-h-64 object-contain bg-gray-50 hover:opacity-90 transition-opacity cursor-zoom-in" />
                      </a>
                    ) : (
                      <div className="p-4 bg-gray-50 flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Document Attached</span>
                        <a href={selectedComplaint.attachment} download={`Proof_${selectedComplaint.id}`} className="ml-4 text-xs font-bold text-indigo-600 hover:text-indigo-800">Download</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Threaded Messaging Interface */}
              <div className="border-t border-gray-100 pt-6 mt-6">
                <span className="text-sm text-gray-500 font-medium mb-4 block">Interactive Communication Thread</span>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl flex flex-col h-72 overflow-hidden">
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {/* Render legacy adminReply mapping nicely if exists */}
                    {selectedComplaint.adminReply && !(selectedComplaint.messages && selectedComplaint.messages.length > 0) && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-bl-none shadow-sm">
                          <p className="font-semibold text-xs text-indigo-700 mb-1">Administrator • Legacy Response</p>
                          {selectedComplaint.adminReply}
                        </div>
                      </div>
                    )}

                    {/* Render new structured messages object */}
                    {selectedComplaint.messages && selectedComplaint.messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === currentRole ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm 
                          ${msg.sender === currentRole ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' :
                            msg.sender === 'admin' ? 'bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-bl-none shadow-sm' :
                              'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}
                        >
                          {msg.sender !== currentRole && (
                            <p className={`font-semibold text-xs mb-1 ${msg.sender === 'admin' ? 'text-indigo-700' : 'text-gray-500'}`}>
                              {msg.sender === 'admin' ? 'Administrator' : 'User'} • {msg.date}
                            </p>
                          )}
                          {msg.text && <p className="mb-1 leading-relaxed">{msg.text}</p>}
                          {msg.attachment && (
                            <div className="mt-2 rounded-lg py-1">
                              <a href={msg.attachment} target="_blank" rel="noopener noreferrer">
                                <img src={msg.attachment} alt="attachment" className="max-h-48 rounded-lg object-contain bg-white shadow-sm border border-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in" />
                              </a>
                            </div>
                          )}
                          {msg.sender === currentRole && (
                            <p className="text-[10px] text-indigo-200 mt-1 text-right">{msg.date}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Empty placeholder */}
                    {(!selectedComplaint.messages || selectedComplaint.messages.length === 0) && !selectedComplaint.adminReply && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No messages yet in this thread.</p>
                      </div>
                    )}
                  </div>

                  {selectedComplaint.status === 'Resolved' ? (
                    <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-center text-green-700 font-medium text-sm">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      This complaint has been marked as resolved and the thread is closed.
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex flex-col gap-3">
                      {replyAttachment && (
                        <div className="flex items-center gap-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700 w-fit">
                          <img src={replyAttachment} className="w-8 h-8 rounded object-cover shadow-sm bg-white" alt="preview" />
                          <span className="truncate pr-4 font-medium">Image Ready</span>
                          <button type="button" onClick={() => setReplyAttachment(null)} className="text-indigo-400 hover:text-indigo-700 bg-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                        </div>
                      )}
                      <div className="flex gap-2 items-center w-full">
                        <label className="cursor-pointer text-gray-400 hover:text-indigo-600 transition p-2 bg-gray-50 rounded-xl border border-gray-200 flex-shrink-0">
                          <Paperclip className="w-5 h-5" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleReplyFileUpload} />
                        </label>
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type a message or upload photo..."
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                        />
                        <button type="submit" disabled={!replyText.trim() && !replyAttachment} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm">
                          Send
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setSelectedComplaint(null)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
                Close
              </button>
              {currentRole === 'admin' && (
                <button onClick={() => handleDeleteComplaint(selectedComplaint.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm">
                  Delete Complaint
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-40">
        {chatOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl w-80 border border-gray-200 overflow-hidden flex flex-col h-[400px] animate-in slide-in-from-bottom-5">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="font-bold flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                SmartCMS Support
              </div>
              <button onClick={() => setChatOpen(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your doubt..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-gray-50"
              />
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition">
                <MessageCircle className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-indigo-600 rounded-full shadow-xl shadow-indigo-200 flex items-center justify-center text-white hover:bg-indigo-700 transition hover:-translate-y-1"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
