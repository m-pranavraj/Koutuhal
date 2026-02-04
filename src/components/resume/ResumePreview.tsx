import { useResume } from '@/context/ResumeContext';
import { PDFViewer } from '@react-pdf/renderer';
import PDFDocument from './PDFDocument';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const ResumePreview = () => {
    const { resumeData } = useResume();
    const [debouncedData, setDebouncedData] = useState(resumeData);
    const [isClient, setIsClient] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setIsUpdating(true);
        const handler = setTimeout(() => {
            setDebouncedData(resumeData);
            setIsUpdating(false);
        }, 600); // 600ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [resumeData]);

    if (!isClient) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="w-full h-full min-h-[600px] shadow-2xl bg-slate-900 rounded-lg overflow-hidden relative">
            <PDFViewer
                width="100%"
                height="100%"
                className="w-full h-full border-none"
                showToolbar={true}
            >
                <PDFDocument data={debouncedData} />
            </PDFViewer>

            {isUpdating && (
                <div className="absolute top-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 backdrop-blur-sm shadow-xl z-50">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating Preview...
                </div>
            )}
        </div>
    );
};

export default ResumePreview;
