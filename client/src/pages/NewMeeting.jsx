import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Brain, LayoutDashboard, Plus, ArrowLeft, Upload, FileText, Mic } from 'lucide-react';

const NewMeeting = () => {
    useContext(AuthContext);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [transcript, setTranscript] = useState('');
    const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'file' | 'audio'
    const [fileUrl, setFileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'txt') {
            const reader = new FileReader();
            reader.onload = (event) => setTranscript(event.target.result);
            reader.readAsText(file);
            setInputMode('file');
            setFileUrl('');
            return;
        }

        // For other types (pdf, docx, audio) upload to server and let backend store
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post(`/uploads`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (data.extractedText) {
                setTranscript(data.extractedText);
            }
            if (data.url) {
                setFileUrl(data.url);
                // if no extracted text, set a placeholder transcript so meeting can be created
                if (!data.extractedText) {
                    if (ext === 'mp3' || ext === 'wav') setTranscript(`Audio uploaded: ${data.url}`);
                    else setTranscript(`File uploaded: ${data.url}`);
                }
            }
            setInputMode(ext === 'mp3' || ext === 'wav' ? 'audio' : 'file');
        } catch (err) {
            console.error('Upload failed', err);
            setError('File upload failed.');
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
            const payload = { title, transcript, transcriptType: inputMode, fileUrl };
            const { data } = await api.post(`/meetings`, payload);

            // 2. Head to processing screen which will trigger AI analysis, then redirect to results
            navigate(`/meetings/${data._id}/processing`);
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Transcript box */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 h-64 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><FileText className="w-5 h-5 text-slate-600" /></div>
                                        <h4 className="text-sm font-semibold text-slate-800">Transcript</h4>
                                    </div>
                                    <span className="text-xs text-slate-500">Paste</span>
                                </div>
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    className="flex-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-mono text-slate-700 resize-none outline-none"
                                    placeholder="Paste the raw meeting conversation here..."
                                />
                            </div>

                            {/* File upload box */}
                            <label className="cursor-pointer bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center h-64 text-center">
                                <Upload className="w-8 h-8 text-blue-600 mb-3" />
                                <div className="text-sm font-semibold text-slate-800 mb-1">Upload Transcript File</div>
                                <div className="text-xs text-slate-500 mb-3">.txt, .pdf, .docx</div>
                                <div className="text-xs text-slate-400">Click or drag file to upload</div>
                                <input type="file" onChange={handleFileUpload} accept=".txt,.pdf,.docx" className="hidden" />
                            </label>

                            {/* Audio upload box */}
                            <label className="cursor-pointer bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center h-64 text-center">
                                <Mic className="w-8 h-8 text-pink-600 mb-3" />
                                <div className="text-sm font-semibold text-slate-800 mb-1">Upload Audio</div>
                                <div className="text-xs text-slate-500 mb-3">.mp3, .wav</div>
                                <div className="text-xs text-slate-400">Upload audio for transcription</div>
                                <input type="file" onChange={handleFileUpload} accept=".mp3,.wav" className="hidden" />
                            </label>
                        </div>

                        <div className="pt-4 flex justify-center">
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
