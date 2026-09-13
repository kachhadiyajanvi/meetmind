import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Brain, LayoutDashboard, Plus, ArrowLeft } from 'lucide-react';

const NewMeeting = () => {
    const { apiUrl } = useContext(AuthContext);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Future feature: Handle file upload logic for TXT/PDF (TXT is direct read, PDF would need parsing)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setTranscript(event.target.result);
        };
        // If it's just TXT
        if (file.type === 'text/plain') {
            reader.readAsText(file);
        } else {
            setError("Currently only TXT files can be directly parsed here. Please paste transcript for other formats or implement backend parse.");
        }
    };

    const handleCreate = async () => {
        if (!title || !transcript) {
            setError("Please provide a title and transcript.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Create meeting
            const { data } = await api.post(`/meetings`, { title, transcript });

            // 2. Head to results screen
            navigate(`/meetings/${data._id}`);
        } catch (err) {
            console.error(err);
            setError("Failed to create meeting.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900">New Meeting</h1>
                            <p className="text-slate-500">Provide a transcript to generate actionable insights.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
                                placeholder="e.g. Q3 Marketing Sync"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Transcript</label>
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm text-slate-700 resize-none h-64"
                                placeholder="Paste the raw meeting conversation here..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                                <span>Or upload a .txt transcript</span>
                            </label>
                            <input type="file" onChange={handleFileUpload} accept=".txt" className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                disabled={loading}
                                onClick={handleCreate}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Generate Insights'}
                                <Brain className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewMeeting;
