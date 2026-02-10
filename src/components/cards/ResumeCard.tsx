import { Button } from '@/components/ui/button';
import { LucideIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResumeCardProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    features?: string[];
    variant?: 'blue' | 'green' | 'teal'; // Updated variants to match reference more closely
    to?: string;
    buttonText?: string;
}

export const ResumeCard = ({
    icon: Icon,
    title,
    subtitle,
    features = [],
    variant = 'blue',
    to = "#",
    buttonText = "Get Started"
}: ResumeCardProps) => {

    // Color configurations based on the "Perfect Your Resume" design
    const styles = {
        blue: {
            header: "bg-[#1e3a8a]", // Dark Blue
            iconBg: "bg-[#ADFF44]/20",
            button: "bg-[#1e3a8a] hover:bg-[#172554]",
            border: "border-[#ADFF44]/20"
        },
        green: {
            header: "bg-[#0f766e]", // Teal/Green
            iconBg: "bg-teal-500/20",
            button: "bg-[#0f766e] hover:bg-[#115e59]",
            border: "border-teal-100"
        },
        teal: {
            header: "bg-[#0891b2]", // Cyan/Teal
            iconBg: "bg-cyan-500/20",
            button: "bg-[#0891b2] hover:bg-[#0e7490]",
            border: "border-cyan-100"
        }
    };

    const style = styles[variant] || styles.blue;

    return (
        <div className={`flex flex-col h-full bg-neutral-900 rounded-2xl shadow-lg overflow-hidden border ${style.border} hover:-translate-y-1 transition-transform duration-300`}>
            {/* Solid Header */}
            <div className={`${style.header} p-8 text-center text-white`}>
                <div className={`w-16 h-16 mx-auto rounded-2xl ${style.iconBg} backdrop-blur-sm flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 uppercase tracking-wide">{title}</h3>
                {subtitle && <p className="text-[#ADFF44]/80/90 text-sm font-medium opacity-90">{subtitle}</p>}
            </div>

            {/* Content Body */}
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">WHAT YOU GET:</h4>
                    <ul className="space-y-3 mb-8">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-gray-600 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Button */}
                <Link to={to} className="w-full">
                    <Button className={`w-full ${style.button} text-white font-bold py-6 rounded-xl transition-all shadow-md`}>
                        {buttonText} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};
