import { Button, IconButton, Tooltip, useToast } from "@chakra-ui/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useIsSaved, useWishlistStore } from "../store/wishlist";

// Heart button to save a book for later. Logged-out visitors are sent to log in first.
// `withLabel` shows "Save" / "Saved" text next to the heart.
const WishlistButton = ({ book, withLabel = false, ...props }) => {
	const user = useAuthStore((state) => state.user);
	const isSaved = useIsSaved(book._id);
	const toggle = useWishlistStore((state) => state.toggle);
	const toast = useToast();
	const navigate = useNavigate();
	const location = useLocation();
	const label = isSaved ? `Remove ${book.title} from wishlist` : `Save ${book.title} to wishlist`;

	const handleClick = async (e) => {
		e.preventDefault(); // the button sits inside a clickable card
		if (!user) {
			toast({ title: "Log in to save books", description: "Your wishlist is kept with your account.", status: "info" });
			navigate("/login", { state: { from: location.pathname + location.search } });
			return;
		}
		const { success, saved, message } = await toggle(book);
		if (!success) toast({ title: "Couldn't update your wishlist", description: message, status: "error" });
		else toast({ title: saved ? "Saved to your wishlist" : "Removed from your wishlist", status: saved ? "success" : "info", duration: 1500 });
	};

	const icon = isSaved ? <FaHeart /> : <FaRegHeart />;
	if (withLabel) {
		return (
			<Button leftIcon={icon} variant='outline' colorScheme={isSaved ? "pink" : "gray"} onClick={handleClick} aria-pressed={isSaved} aria-label={label} {...props}>
				{isSaved ? "Saved" : "Save"}
			</Button>
		);
	}
	return (
		<Tooltip label={isSaved ? "Remove from wishlist" : "Save for later"} openDelay={300}>
			<IconButton aria-label={label} aria-pressed={isSaved} icon={icon} onClick={handleClick} variant='ghost' colorScheme={isSaved ? "pink" : "gray"} rounded='full' position='relative' zIndex={1} {...props} />
		</Tooltip>
	);
};
export default WishlistButton;
