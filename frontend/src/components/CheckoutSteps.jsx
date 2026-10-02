import { Box, Step, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";

const STEPS = ["Cart", "Delivery details", "Done"];

// Cart → Delivery details → Done
const CheckoutSteps = ({ active }) => (
	<Stepper index={active} colorScheme='brand' size='sm' mb={8} maxW='lg'>
		{STEPS.map((title) => (
			<Step key={title}>
				<StepIndicator>
					<StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
				</StepIndicator>
				<Box flexShrink='0'>
					<StepTitle>{title}</StepTitle>
				</Box>
				<StepSeparator />
			</Step>
		))}
	</Stepper>
);
export default CheckoutSteps;
