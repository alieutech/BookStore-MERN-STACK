import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Start each new page at the top, or at the #anchor in the link.
// Changing only the filters in the URL (?q=...) keeps the scroll position.
const ScrollToTop = () => {
	const { pathname, hash } = useLocation();
	useEffect(() => {
		if (hash) {
			// Wait for the page to render the target
			const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
			return () => clearTimeout(timer);
		}
		window.scrollTo(0, 0);
	}, [pathname, hash]);
	return null;
};
export default ScrollToTop;
