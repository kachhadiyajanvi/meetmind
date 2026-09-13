import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Settings as SettingsIcon, LogOut } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </Link>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <SettingsIcon className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold">Account Settings</h1>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                            <div className="p-3 bg-slate-50 rounded-lg text-slate-800 font-medium">{user?.name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <div className="p-3 bg-slate-50 rounded-lg text-slate-800 font-medium">{user?.email}</div>
                        </div>
                        <div className="pt-6">
                            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors">
                                <LogOut className="w-5 h-5" /> Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
