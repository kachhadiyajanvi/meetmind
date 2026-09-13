import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, History as HistoryIcon } from 'lucide-react';

const History = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </Link>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <HistoryIcon className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold">Meeting History</h1>
                    </div>
                    <p className="text-slate-600">This feature is part of Phase 2 logic execution. Access your dashboard instead for a list of recent meetings.</p>
                </div>
            </div>
        </div>
    );
};

export default History;
