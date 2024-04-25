import { useEffect, useState } from "react";

/**
 * Hook that returns the width of the window.
 */
const useResponsiveness = () => {
  const [prevWidth, setPrevWidth] = useState(window.innerWidth);

  useEffect(() => {
    const updateBySize = () => {
      if (prevWidth !== window.innerWidth) {
        setPrevWidth(window.innerWidth);
      }
    };
    window.addEventListener("resize", updateBySize);
    return () => window.removeEventListener("resize", updateBySize);
  }, [prevWidth]);

  return prevWidth;
};

export default useResponsiveness;
