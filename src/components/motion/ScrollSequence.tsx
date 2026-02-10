import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface ScrollSequenceProps {
    frameCount: number;
    path: string;
    extension?: string;
    digits?: number;
    className?: string; // Allow custom sizing/positioning
    scrollRef?: React.RefObject<HTMLElement>; // Optional ref to track
}

export default function ScrollSequence({
    frameCount = 80,
    path = "/3d-sequence/ezgif-frame-",
    extension = ".jpg",
    digits = 3,
    className = "",
    scrollRef
}: ScrollSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Scroll Progress
    const { scrollYProgress } = useScroll({
        target: scrollRef || undefined, // Track specific container or window
        offset: ["start start", "end end"],
    });

    // Map scroll (0 to 1) to frame index (0 to frameCount - 1)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

    // Preload Images
    useEffect(() => {
        let loadedCount = 0;
        const imgArray: HTMLImageElement[] = [];

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const num = i.toString().padStart(digits, "0");
            img.src = `${path}${num}${extension}`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === frameCount) setIsLoaded(true);
            };
            imgArray.push(img);
        }
        setImages(imgArray);
    }, [frameCount, path, extension, digits]);

    // Render Frame
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context || images.length === 0) return;

        const render = (index: number) => {
            const img = images[Math.round(index)];
            if (!img) return;

            // "Cover" Fit Logic + Zoom (1.1x) to hide watermark
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;

            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;

            const scale = 1.1; // 10% Zoom to crop edges

            // Calculate dimensions to COVER the canvas
            if (canvasRatio > imgRatio) {
                // Canvas is wider than image -> Scale image width to match canvas width
                drawWidth = canvas.width * scale;
                drawHeight = (drawWidth / imgRatio);
            } else {
                // Canvas is taller/narrower -> Scale image height to match canvas height
                drawHeight = canvas.height * scale;
                drawWidth = (drawHeight * imgRatio);
            }

            // Center image
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = (canvas.height - drawHeight) / 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            // Chroma Key (Remove Dark Background)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const threshold = 50; // Cutoff for dark background
            const fadeWidth = 30; // Soft edge for anti-aliasing

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;

                if (brightness < threshold) {
                    data[i + 3] = 0; // Fully transparent
                } else if (brightness < threshold + fadeWidth) {
                    // Smooth alpha transition
                    const alpha = ((brightness - threshold) / fadeWidth) * 255;
                    data[i + 3] = alpha;
                }
            }
            context.putImageData(imageData, 0, 0);
        };

        // Initial render
        render(frameIndex.get());

        // Subscribe to scroll changes
        const unsubscribe = frameIndex.on("change", (latest) => {
            requestAnimationFrame(() => render(latest));
        });

        return () => unsubscribe();
    }, [isLoaded, frameIndex, images]);

    // Handle Resize (High-DPI Support)
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                // Get the display size (CSS pixels)
                const rect = canvasRef.current.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;

                // Set actual size in memory (scaled to account for extra pixel density)
                canvasRef.current.width = rect.width * dpr;
                canvasRef.current.height = rect.height * dpr;

                // Scale context to ensure correct drawing operations? 
                // No, because our render logic calculates drawWidth based on canvas.width (which is now scaled),
                // so drawImage will fill the high-res buffer correctly.
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Init
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ filter: 'contrast(1.2) brightness(1.1)' }}
            />

            {/* Loading State overlay */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                    <div className="w-8 h-8 border-4 border-[#ADFF44] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
