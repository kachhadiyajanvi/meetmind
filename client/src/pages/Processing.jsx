import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Brain, Sparkles, Server } from 'lucide-react';

const Processing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    useContext(AuthContext);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const processMeeting = async () => {
            try {
                await api.post(`/meetings/${id}/analyze`);
                if (isMounted) navigate(`/meetings/${id}`);
            } catch (err) {
                console.error('Processing error', err);
                // Server analyze failed (likely 500). Attempt a client-side fallback summarization
                try {
                    // fetch meeting (includes transcript)
                    const { data } = await api.get(`/meetings/${id}`);
                    const meeting = data.meeting || data;
                    const transcript = meeting?.transcript || '';

                    // Simple extractive summary
                    const sentences = transcript.match(/[^.!?]+[.!?]?/g) || [transcript];
                    const summary = sentences.slice(0, 4).map(s => s.trim()).join(' ');

                    // extract decision lines
                    const decisionLines = transcript.split(/\n+/).filter(l => /decid|decision|agree|agreed|we will|we'll|let's|lets|conclude/i.test(l)).map(l => l.trim()).slice(0,5);

                    // extract task-like lines
                    const taskLines = transcript.split(/\n+/).filter(l => /action|todo|task|follow up|follow-up|assign to|assign/i.test(l)).map(l => l.trim()).slice(0,10);
                    const tasks = taskLines.map(line => ({ description: line, assignee: 'Unassigned', deadline: 'No deadline specified', priority: 'Medium' }));

                    // save summary + decisions via API
                    await api.put(`/meetings/${id}`, { summary, decisions: decisionLines });

                    // create tasks
                    for (const t of tasks) {
                        try { await api.post(`/meetings/${id}/tasks`, t); } catch (e) { console.error('Failed to create task', e); }
                    }

                    if (isMounted) navigate(`/meetings/${id}`);
                } catch (fallbackErr) {
                    console.error('Fallback processing error', fallbackErr);
                    if (isMounted) setError('AI processing failed and fallback also failed. Please try again.');
                }
            }
        };
        processMeeting();
        return () => { isMounted = false; };
    }, [id, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            {error ? (
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-md text-center">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Processing Error</h3>
                    <p className="text-red-200 mb-6">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition">
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <div className="text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full"></div>

                    <div className="relative flex justify-center mb-10">
                        <div className="relative">
                            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center animate-pulse shadow-2xl shadow-blue-600/50">
                                <Brain className="w-12 h-12 text-white" />
                            </div>
                            <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-blue-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                            <Server className="absolute -bottom-4 -left-4 w-8 h-8 text-indigo-400 animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold text-white mb-4 relative z-10">AI is Analyzing the Transcript</h2>
                    <p className="text-slate-400 text-lg relative z-10 max-w-sm mx-auto">
                        Extracting summaries, tracking decisions, and gathering deliverables in real-time...
                    </p>

                    <div className="mt-12 relative z-10">
                        <ul className="max-w-md mx-auto text-left space-y-3">
                            {[
                                'Reading conversation',
                                'Understanding context',
                                'Detecting decisions',
                                'Extracting tasks',
                                'Assigning priorities'
                            ].map((s, i) => (
                                <li key={s} className="flex items-center gap-3 text-slate-200">
                                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white animate-pulse" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /></svg>
                                    </span>
                                    <span className="text-lg">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Processing;
