import { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/button';
import { Eye, Save, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResumeForm from '@/components/resume/ResumeForm';
import ResumePreview from '@/components/resume/ResumePreview';
import { TemplateSelector } from '@/components/resume/TemplateSelector';

const ResumeBuilder = () => {
    const { resumeData } = useResume();
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-900 dark:bg-black flex flex-col pt-16">
            {/* Builder Header */}
            <header className="bg-neutral-900 dark:bg-black border-b border-gray-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between sticky top-16 z-20">
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
                    <Button className="bg-[#ADFF44] hover:bg-[#9BE63D] text-black">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">

                {/* Left Panel: Editor Form (Fixed Sidebar) */}
                <div className={`w-full lg:w-[480px] xl:w-[520px] shrink-0 overflow-y-auto border-r border-gray-200 dark:border-neutral-800 p-6 bg-neutral-900 dark:bg-black ${showPreviewMobile ? 'hidden lg:block' : 'block'}`}>
                    <div className="max-w-2xl mx-auto space-y-8 pb-20">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Editor</h2>
                            <p className="text-gray-500 dark:text-gray-400">Fill in your details to auto-generate your resume.</p>
                        </div>

                        <TemplateSelector />
                        <ResumeForm />
                    </div>
                </div>

                {/* Right Panel: Live Preview (Fluid) */}
                <div className={`flex-1 bg-slate-200/50 dark:bg-black/50 p-4 lg:p-8 flex items-center justify-center overflow-hidden ${showPreviewMobile ? 'block fixed inset-0 z-50 bg-neutral-900' : 'hidden lg:flex'}`}>
                    {/* Mobile Close Button */}
                    {showPreviewMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-50 lg:hidden"
                            onClick={() => setShowPreviewMobile(false)}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    )}

                    <div className="w-full h-full max-w-[1000px] shadow-2xl rounded-lg overflow-hidden ring-1 ring-slate-900/5">
                        <ResumePreview />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResumeBuilder;
