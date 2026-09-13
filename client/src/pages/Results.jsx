import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Edit2, Trash2, Check, Download, Mail, Plus, X, Brain } from 'lucide-react';

const Results = () => {
    const { id } = useParams();
    const { apiUrl } = useContext(AuthContext);
    const [meeting, setMeeting] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Email state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const [emailStatus, setEmailStatus] = useState('');

    // Task editing state
    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isAddingTask, setIsAddingTask] = useState(false);

    useEffect(() => {
        fetchMeetingData();
    }, [id, apiUrl]);

    const fetchMeetingData = async () => {
        try {
            const { data } = await axios.get(`${apiUrl}/meetings/${id}`);
            setMeeting(data.meeting);
            setTasks(data.tasks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleExport = async (type) => {
        try {
            const { data } = await axios.get(`${apiUrl}/meetings/${id}/export/${type}`);
            // Usually would window.open but server returns path
            window.open(`https://meetmind-cj0u.onrender.com/${data.url}`, '_blank');
        } catch (err) {
            console.error('Export error', err);
        }
    };

    const handleSendEmail = async () => {
        setEmailStatus('sending');
        try {
            await axios.post(`${apiUrl}/meetings/${id}/email`, { email: emailTo });
            setEmailStatus('success');
            setTimeout(() => { setShowEmailModal(false); setEmailStatus(''); }, 2000);
        } catch (err) {
            setEmailStatus('error');
        }
    };

    // Task inline editing logic
    const startEdit = (t) => {
        setEditingTask(t._id);
        setEditForm(t);
    };

    const saveEdit = async () => {
        try {
            await axios.put(`${apiUrl}/meetings/${id}/tasks/${editingTask}`, editForm);
            setTasks(tasks.map(t => t._id === editingTask ? { ...t, ...editForm } : t));
            setEditingTask(null);
        } catch (err) {
            console.error(err);
        }
    };

    const saveNewTask = async () => {
        try {
            const { data } = await axios.post(`${apiUrl}/meetings/${id}/tasks`, editForm);
            setTasks([...tasks, data]);
            setIsAddingTask(false);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${apiUrl}/meetings/${id}/tasks/${taskId}`);
            setTasks(tasks.filter(t => t._id !== taskId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!meeting) return <div className="p-12 text-center">Meeting not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">{meeting.title}</h1>
                            <p className="text-sm text-slate-500">Processed on {new Date(meeting.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">
                            <Mail className="w-4 h-4" /> Share
                        </button>
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition shadow-sm">
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">Export as PDF</button>
                                <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">Export as DOCX</button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
                {/* Core Info */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-blue-600" /> AI Executive Summary
                            </h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{meeting.summary}</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Key Decisions</h2>
                            <ul className="space-y-3">
                                {meeting.decisions && meeting.decisions.length > 0 ? (
                                    meeting.decisions.map((d, i) => (
                                        <li key={i} className="flex gap-3 text-slate-600">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">{d}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-slate-500 italic">No explicit decisions identified.</p>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl sticky top-28 text-center pt-8">
                            <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl font-bold text-slate-800">{tasks.length}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Action Items Generated</h3>
                            <p className="text-sm text-slate-500 mb-6">Review, edit, and assign to your team instantly.</p>
                            <button onClick={() => {
                                setIsAddingTask(true);
                                setEditForm({ description: '', assignee: 'Unassigned', deadline: 'No deadline specified', priority: 'Medium', status: 'Pending' });
                            }} className="w-full flex justify-center items-center gap-2 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-slate-50 transition border border-slate-200">
                                <Plus className="w-4 h-4" /> Add Task Manually
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-900">Task Management</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-8 py-4 w-2/5">Task</th>
                                    <th className="px-4 py-4">Assignee</th>
                                    <th className="px-4 py-4">Deadline</th>
                                    <th className="px-4 py-4">Priority</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isAddingTask && (
                                    <tr className="bg-blue-50/50">
                                        <td className="px-8 py-4">
                                            <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Task description..." value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <input className="w-full px-3 py-2 border rounded-lg text-sm" value={editForm.assignee} onChange={e => setEditForm({ ...editForm, assignee: e.target.value })} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <input className="w-full px-3 py-2 border rounded-lg text-sm" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                                                <option>High</option><option>Medium</option><option>Low</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-4 text-right flex justify-end gap-2 text-sm mt-1">
                                            <button onClick={saveNewTask} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                                            <button onClick={() => setIsAddingTask(false)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">Cancel</button>
                                        </td>
                                    </tr>
                                )}
                                {tasks.map(t => {
                                    const isEditing = editingTask === t._id;
                                    return (
                                        <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                {isEditing ? (
                                                    <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                                                ) : (
                                                    <span className={`text-slate-800 font-medium ${t.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{t.description}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-5 font-medium text-slate-600 text-sm">
                                                {isEditing ? (
                                                    <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={editForm.assignee} onChange={e => setEditForm({ ...editForm, assignee: e.target.value })} />
                                                ) : t.assignee}
                                            </td>
                                            <td className="px-4 py-5 text-sm text-slate-500">
                                                {isEditing ? (
                                                    <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
                                                ) : t.deadline}
                                            </td>
                                            <td className="px-4 py-5">
                                                {isEditing ? (
                                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                                                        <option>High</option>
                                                        <option>Medium</option>
                                                        <option>Low</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(t.priority)}`}>
                                                        {t.priority}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={saveEdit} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Check className="w-5 h-5" /></button>
                                                        <button onClick={() => setEditingTask(null)} className="text-slate-400 p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                                                        <button onClick={async () => {
                                                            await axios.put(`${apiUrl}/meetings/${id}/tasks/${t._id}`, { status: t.status === 'Completed' ? 'Pending' : 'Completed' });
                                                            setTasks(tasks.map(task => task._id === t._id ? { ...task, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : task));
                                                        }} className={`p-2 rounded-lg transition-colors ${t.status === 'Completed' ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`} title="Mark completed">
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => startEdit(t)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors" title="Edit task">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => deleteTask(t._id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete task">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {tasks.length === 0 && !isAddingTask && (
                                    <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-500">No tasks generated for this meeting.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setShowEmailModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Share via Email</h3>
                        <p className="text-sm text-slate-500 mb-6">Send the summary, decisions, and tasks directly to an inbox.</p>
                        <input type="email" placeholder="recipient@example.com" value={emailTo} onChange={e => setEmailTo(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4" />
                        <button onClick={handleSendEmail} disabled={emailStatus === 'sending'} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                            {emailStatus === 'sending' ? 'Sending...' : emailStatus === 'success' ? 'Sent!' : emailStatus === 'error' ? 'Failed to send' : 'Send Report'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;
