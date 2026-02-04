import { useResume } from '@/context/ResumeContext';
import { PDFViewer } from '@react-pdf/renderer';
import PDFDocument from './PDFDocument';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const ResumePreview = () => {
    const { resumeData } = useResume();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="w-full h-full min-h-[600px] shadow-2xl bg-slate-900 rounded-lg overflow-hidden">
            <PDFViewer
                width="100%"
                height="100%"
                className="w-full h-full border-none"
                showToolbar={true}
            >
                <PDFDocument data={resumeData} />
            </PDFViewer>
        </div>
    );
};

export default ResumePreview;
