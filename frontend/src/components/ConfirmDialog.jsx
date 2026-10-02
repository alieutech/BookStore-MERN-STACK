import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from "@chakra-ui/react";
import { useRef, useState } from "react";

// "Are you sure?" dialog for destructive actions
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, body, confirmLabel = "Delete" }) => {
	const cancelRef = useRef();
	const [isWorking, setIsWorking] = useState(false);

	const handleConfirm = async () => {
		setIsWorking(true);
		await onConfirm();
		setIsWorking(false);
		onClose();
	};

	return (
		<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
			<AlertDialogOverlay>
				<AlertDialogContent mx={4}>
					<AlertDialogHeader fontFamily='heading'>{title}</AlertDialogHeader>
					<AlertDialogBody color='text.muted'>{body}</AlertDialogBody>
					<AlertDialogFooter gap={3}>
						<Button ref={cancelRef} onClick={onClose} variant='ghost' colorScheme='gray'>
							Cancel
						</Button>
						<Button colorScheme='red' onClick={handleConfirm} isLoading={isWorking}>
							{confirmLabel}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
};
export default ConfirmDialog;
