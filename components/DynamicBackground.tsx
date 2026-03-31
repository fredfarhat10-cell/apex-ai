import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const DynamicBackground: React.FC = () => {
    const appBackground = useStore((state) => state.appBackground);
    const symbiontFeed = useStore((state) => state.symbiontFeed);
    const [pulse, setPulse] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Prevent pulsing on initial page load
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (symbiontFeed.length > 0) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 1000); // Must match pulse animation duration
            return () => clearTimeout(timer);
        }
    }, [symbiontFeed]);

    if (!appBackground) {
        return null;
    }

    return (
        <div 
            key={appBackground} // Re-trigger fade-in animation when the image source changes
            className={`fixed inset-0 z-[-1] overflow-hidden bg-apex-darker animate-fadeIn ${pulse ? 'animate-pulseBg' : ''}`}
        >
            <img 
                src={appBackground} 
                alt="Dynamic application background" 
                className="absolute inset-0 w-full h-full object-cover animate-kenBurns"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
    );
};

export default DynamicBackground;
