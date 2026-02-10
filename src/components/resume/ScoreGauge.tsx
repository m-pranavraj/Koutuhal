import { motion } from 'framer-motion';

interface Props {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    color?: string;
}

const ScoreGauge = ({ score, size = 120, strokeWidth = 10, label = "Match Score", color }: Props) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (color) return color;
        if (s >= 80) return "#22c55e"; // Green-500
        if (s >= 50) return "#eab308"; // Yellow-500
        return "#ef4444"; // Red-500
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-slate-100 dark:text-white"
                    />
                    {/* Foreground Circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={getColor(score)}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white dark:text-white">
                        {score}%
                    </span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-neutral-500 uppercase tracking-wider">
                {label}
            </span>
        </div>
    );
};

export default ScoreGauge;
