import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Brain, Sparkles, Server } from 'lucide-react';

const Processing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiUrl } = useContext(AuthContext);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const processMeeting = async () => {
            try {
                await axios.post(`${apiUrl}/meetings/${id}/analyze`);
                if (isMounted) navigate(`/meetings/${id}`);
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || 'AI processing failed. Please try again.');
            }
        };
        processMeeting();
        return () => { isMounted = false; };
    }, [id, apiUrl, navigate]);

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

                    <div className="mt-12 flex justify-center gap-2 relative z-10">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Processing;
