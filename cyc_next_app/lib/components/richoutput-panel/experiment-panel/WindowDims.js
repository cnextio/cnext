import { useEffect, useState } from "react";

function getWindowDims() {
    if (typeof window !== "undefined") {
        const { innerWidth: winWidth, innerHeight: winHeight } = window;
        return {
            winWidth,
            winHeight
        };      
    }
    else 
        return {undefined, undefined};
}
  
export default function useWindowDims() {
    const [windowDims, setWindowDims] = useState(getWindowDims());

    useEffect(() => {
        function handleResize() {
            setWindowDims(getWindowDims());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDims;
}