import { useEffect, useState } from "react";

/**
 * @typedef {Object} WindowSize
 * @property {number|undefined} width - The current width of the window.
 * @property {number|undefined} height - The current height of the window.
 */

/**
 * A custom React hook that listens to window resize events and provides the current window size.
 *
 * @returns {WindowSize} The current window size with properties `width` and `height`.
 */
function useWindowSize() {
	// Initialize state with undefined width/height so server and client renders match
	const [windowSize, setWindowSize] = useState({
		width: undefined,
		height: undefined,
	});

	useEffect(() => {
		/**
		 * Handles the window resize event by setting the new window size in the state.
		 */
		function handleResize() {
			// Set window width/height to state
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Call handler right away so state gets updated with initial window size
		handleResize();

		// Remove event listener on cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []); // Empty array ensures that effect is only run on mount and unmount

	return windowSize;
}

export default useWindowSize;
