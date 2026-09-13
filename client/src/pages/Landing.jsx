import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
            {/* Navigation */}
            <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <Brain className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">MeetMind AI</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Log in
                        </Link>
                        <Link to="/register" className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <section className="pt-32 pb-24 px-4 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                            MeetMind AI is now natively ready for Hackathons
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                            AI Meeting Intelligence
                        </h1>
                        <p className="text-xl text-slate-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                            From meeting conversations to actionable outcomes — automatically.
                        </p>
                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Turn meeting conversations into summaries, decisions and actionable tasks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 group text-lg">
                                Try MeetMind AI
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Showcase */}
                <section className="py-24 bg-white px-4">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-16">Supercharge your workflow</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: FileText, title: 'Instant Summaries', desc: 'No more reading through hours of transcripts. Get concise context instantly.' },
                                { icon: CheckCircle, title: 'Smart Task Extraction', desc: 'Auto-identify assignees, deadlines, and granular priorities purely from context.' },
                                { icon: Clock, title: 'Export & Share', desc: 'Generate beautiful PDF/DOCX reports or email them directly to your team.' }
                            ].map((f, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all cursor-default group">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <f.icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Landing;
