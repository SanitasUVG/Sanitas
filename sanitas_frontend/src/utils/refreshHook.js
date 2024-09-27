import { useState } from "react";

/**
 * @typedef {Object} RefreshSignal
 */

/**
 * @callback TriggerRefreshSignalCallback
 * @returns {void}
 */

/**
 * Hook to trigger a rerender of a component.
 * @returns {[RefreshSignal, TriggerRefreshSignalCallback]} A signal to depend on and a function to trigger the signal.
 */
export const createRefreshSignal = () => {
	const [innerState, setInnerState] = useState(false);
	const triggerRefresh = () => {
		setInnerState(!innerState);
	};
	return [innerState, triggerRefresh];
};
