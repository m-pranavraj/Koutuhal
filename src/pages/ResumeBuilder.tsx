import { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/button';
import { Eye, Save, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResumeForm from '@/components/resume/ResumeForm';
import ResumePreview from '@/components/resume/ResumePreview';

const ResumeBuilder = () => {
    const { resumeData } = useResume();
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-16">
            {/* Builder Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-16 z-20">
                <div className="flex items-center gap-4">
                    <Link to="/resume-active">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Untitled Resume</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last saved: Just now</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="md:hidden"
                        onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreviewMobile ? 'Edit' : 'Preview'}
                    </Button>
                    <Button variant="outline" className="hidden md:flex">
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">

                {/* Left Panel: Editor Form */}
                <div className={`w-full md:w-1/2 lg:w-5/12 overflow-y-auto border-r border-gray-200 dark:border-slate-800 p-6 ${showPreviewMobile ? 'hidden md:block' : 'block'}`}>
                    <div className="max-w-2xl mx-auto space-y-8 pb-20">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Editor</h2>
                            <p className="text-gray-500 dark:text-gray-400">Fill in your details to auto-generate your resume.</p>
                        </div>

                        <ResumeForm />
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className={`w-full md:w-1/2 lg:w-7/12 bg-slate-100 dark:bg-slate-950 overflow-y-auto p-8 flex justify-center ${showPreviewMobile ? 'block' : 'hidden md:flex'}`}>
                    <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.65] lg:scale-[0.85] origin-top transition-transform">
                        <ResumePreview />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResumeBuilder;
