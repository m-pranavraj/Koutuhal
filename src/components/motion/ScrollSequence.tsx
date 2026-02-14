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

/**
 * Enhanced ScrollSequence with Fallback for Missing Images
 */
export default function ScrollSequence({
    frameCount = 40,
    path = "/3d-sequence/ezgif-frame-",
    extension = ".jpg",
    digits = 3,
    className = "",
    scrollRef
}: ScrollSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false); // Track if critical loading errors occurred
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Scroll Progress
    const { scrollYProgress } = useScroll({
        target: scrollRef || undefined,
        offset: ["start start", "end end"],
    });

    // Map scroll (0 to 1) to frame index (0 to frameCount - 1)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

    // Preload Images
    useEffect(() => {
        let loadedCount = 0;
        let localErrorCount = 0;
        const imgArray: HTMLImageElement[] = [];

        // Safety check: if frameCount is unreasonably high or low
        if (frameCount <= 0) {
            setHasError(true);
            return;
        }

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const num = (i * 2 - 1).toString().padStart(digits, "0"); // Skip every other frame for speed
            img.src = `${path}${num}${extension}`;

            img.onload = () => {
                loadedCount++;
                checkCompletion();
            };

            img.onerror = () => {
                localErrorCount++;
                checkCompletion();
            };

            imgArray.push(img);
        }

        function checkCompletion() {
            if (loadedCount + localErrorCount === frameCount) {
                if (loadedCount === 0) {
                    console.warn(`[ScrollSequence] Failed to load ALL ${frameCount} frames. Falling back.`);
                    setHasError(true); // Trigger fallback
                } else {
                    console.log(`[ScrollSequence] Loaded ${loadedCount}/${frameCount} frames.`);
                    setImages(imgArray);
                    setIsLoaded(true);
                }
            }
        }
    }, [frameCount, path, extension, digits]);

    // Handle Resize (High-DPI Support)
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = rect.width * dpr;
                canvasRef.current.height = rect.height * dpr;
                setDimensions({ width: rect.width * dpr, height: rect.height * dpr });
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        // Debounce resize
        const timer = setTimeout(handleResize, 100);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timer);
        };
    }, []);

    // Render Frame Loop
    useEffect(() => {
        if (!isLoaded || images.length === 0 || hasError) return;

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const render = (index: number) => {
            const imgIdx = Math.round(index);
            const img = images[imgIdx];

            // Skip invalid images
            if (!img || !img.complete || img.naturalWidth === 0) return;

            // "Cover" Fit Logic + Zoom (1.1x) to hide watermark
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;

            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;

            const scale = 1.1; // 10% Zoom

            // Calculate dimensions to COVER the canvas
            if (canvasRatio > imgRatio) {
                drawWidth = canvas.width * scale;
                drawHeight = (drawWidth / imgRatio);
            } else {
                drawHeight = canvas.height * scale;
                drawWidth = (drawHeight * imgRatio);
            }

            // Center image
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = (canvas.height - drawHeight) / 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        };

        // Initial render
        render(frameIndex.get());

        // Subscribe to scroll changes
        const unsubscribe = frameIndex.on("change", (latest) => {
            requestAnimationFrame(() => render(latest));
        });

        return () => unsubscribe();
    }, [isLoaded, frameIndex, images, hasError, dimensions]);

    // Render Fallback if critical error (e.g., missing images)
    if (hasError) {
        return (
            <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
                <div className="w-[60%] h-[60%] bg-[#ADFF44]/20 rounded-full animate-pulse blur-xl" />
                <div className="absolute inset-0 flex items-center justify-center text-[#ADFF44]/50 text-xs font-mono">
                    3D_ASSET_OFFLINE
                </div>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{
                    filter: 'contrast(1.2) brightness(1.1)',
                    mixBlendMode: 'screen', // Hardware accelerated background removal
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in'
                }}
            />

            {/* Loading State overlay */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                    <div className="w-8 h-8 border-4 border-[#ADFF44] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
