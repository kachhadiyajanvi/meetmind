import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users, LayoutDashboard, Brain, Clock, ChevronRight, LogOut, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ high: 0, pending: 0, completed: 0 });

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const { data } = await api.get(`/meetings`);
                // we'll just fetch meetings for now, in a real app we'd fetch tasks too to count them
                setMeetings(data);
                // fetch task counts
                try {
                    const { data: c } = await api.get('/meetings/tasks/summary');
                    setCounts(c);
                } catch (e) {
                    console.warn('Failed to fetch task counts', e);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Brain className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">MeetMind AI</span>
                    </div>
                </div>
                <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link to="/meetings/new" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" /> New Meeting
                    </Link>
                </div>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-4 px-2 text-sm font-medium text-slate-700">
                        <Users className="w-4 h-4" /> {user?.name}
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0">
                    <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
                    <Link to="/meetings/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Create Meeting
                    </Link>
                </header>

                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><LayoutDashboard className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Meetings</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{loading ? <span className="inline-block w-20 h-6"><Skeleton className="h-6 w-20" /></span> : meetings.length}</h3>
                                </div>
                            </Card>

                            <Card className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">High Priority Tasks</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="h-6 w-12" /> : counts.high}</h3>
                                </div>
                            </Card>

                            <Card className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Clock className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="h-6 w-12" /> : counts.pending}</h3>
                                </div>
                            </Card>

                            <Card className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="h-6 w-12" /> : counts.completed}</h3>
                                </div>
                            </Card>
                        </div>

                        {/* Recent Meetings */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Meetings</h2>
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            ) : meetings.length === 0 ? (
                                <EmptyState title="No meetings yet" description="Create your first meeting to get actionable insights." cta={<Link to="/meetings/new" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">Create Meeting</Link>} />
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <ul className="divide-y divide-slate-200">
                                        {meetings.map((meeting) => (
                                            <li key={meeting._id}>
                                                <Link to={`/meetings/${meeting._id}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
                                                    <div className="min-w-0">
                                                        <h4 className="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-1">{meeting.title}</h4>
                                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(meeting.createdAt).toLocaleString()}</span>
                                                            <Badge variant={meeting.summary ? 'blue' : 'default'}>{meeting.summary ? 'Analyzed' : 'Raw'}</Badge>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
