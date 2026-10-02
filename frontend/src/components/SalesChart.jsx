import { Box, Button, Flex, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue, useToken } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "../utils/format";

const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 28, left: 56 };
const MAX_BAR = 24;
const GAP = 2;

// Round the axis maximum up to a clean number (1, 2, 5 × 10^n)
const niceMax = (value) => {
	if (value <= 0) return 10;
	const power = 10 ** Math.floor(Math.log10(value));
	return [1, 2, 5, 10].map((step) => step * power).find((step) => step >= value);
};

const shortDate = (key) => new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

// Daily revenue as columns, with a hover tooltip and a table view
const SalesChart = ({ days }) => {
	const containerRef = useRef(null);
	const [width, setWidth] = useState(600);
	const [hovered, setHovered] = useState(null);
	const [showTable, setShowTable] = useState(false);
	// SVG attributes need real color values, not Chakra token names
	const [barLight, barDark, gridLight, gridDark, textLight, textDark] = useToken("colors", ["blue.500", "blue.400", "gray.200", "gray.600", "gray.600", "gray.400"]);
	const barColor = useColorModeValue(barLight, barDark);
	const gridColor = useColorModeValue(gridLight, gridDark);
	const mutedText = useColorModeValue(textLight, textDark);
	const tooltipBg = useColorModeValue("white", "gray.700");

	useEffect(() => {
		const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	const max = niceMax(Math.max(...days.map((day) => day.revenue)));
	const ticks = [0, max / 2, max];
	const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
	const plotHeight = HEIGHT - PAD.top - PAD.bottom;
	const slot = plotWidth / days.length;
	const barWidth = Math.max(Math.min(MAX_BAR, slot - GAP), 1);
	const y = (value) => PAD.top + plotHeight - (value / max) * plotHeight;
	const hoveredDay = hovered !== null ? days[hovered] : null;

	return (
		<Box>
			<Flex justify='flex-end' mb={2}>
				<Button size='xs' variant='ghost' onClick={() => setShowTable(!showTable)}>
					{showTable ? "Show chart" : "Show as table"}
				</Button>
			</Flex>

			{showTable ? (
				<Box maxH='xs' overflowY='auto'>
					<Table size='sm'>
						<Thead>
							<Tr>
								<Th>Date</Th>
								<Th isNumeric>Orders</Th>
								<Th isNumeric>Revenue</Th>
							</Tr>
						</Thead>
						<Tbody>
							{days.map((day) => (
								<Tr key={day.date}>
									<Td>{shortDate(day.date)}</Td>
									<Td isNumeric>{day.orders}</Td>
									<Td isNumeric>{formatPrice(day.revenue)}</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</Box>
			) : (
				<Box ref={containerRef} position='relative' onMouseLeave={() => setHovered(null)}>
					<svg width='100%' height={HEIGHT} role='img' aria-label='Revenue per day for the last 30 days'>
						{ticks.map((tick) => (
							<g key={tick}>
								<line x1={PAD.left} x2={PAD.left + plotWidth} y1={y(tick)} y2={y(tick)} stroke={gridColor} strokeWidth={1} />
								<text x={PAD.left - 8} y={y(tick)} dy='0.32em' textAnchor='end' fontSize='11' fill={mutedText}>
									{formatPrice(tick).replace(".00", "")}
								</text>
							</g>
						))}
						{days.map((day, i) => {
							const x = PAD.left + i * slot + (slot - barWidth) / 2;
							const h = Math.max(y(0) - y(day.revenue), day.revenue > 0 ? 2 : 0);
							const r = Math.min(4, barWidth / 2, h);
							const top = y(0) - h;
							return (
								<g key={day.date} onMouseEnter={() => setHovered(i)}>
									{/* Full-height hit area so small bars are easy to hover */}
									<rect x={PAD.left + i * slot} y={PAD.top} width={slot} height={plotHeight} fill='transparent' />
									{h > 0 && (
										<path
											d={`M${x},${y(0)} V${top + r} Q${x},${top} ${x + r},${top} H${x + barWidth - r} Q${x + barWidth},${top} ${x + barWidth},${top + r} V${y(0)} Z`}
											fill={barColor}
											opacity={hovered === null || hovered === i ? 1 : 0.5}
										/>
									)}
									{/* Label every 7th day, counting back from today, so labels never collide */}
									{(days.length - 1 - i) % 7 === 0 && (
										<text x={PAD.left + i * slot + slot / 2} y={HEIGHT - 8} textAnchor='middle' fontSize='11' fill={mutedText}>
											{shortDate(day.date)}
										</text>
									)}
								</g>
							);
						})}
					</svg>
					{hoveredDay && (
						<Box
							position='absolute'
							top={0}
							left={`${Math.min(Math.max(PAD.left + hovered * slot + slot / 2 - 70, 0), Math.max(width - 140, 0))}px`}
							w='140px'
							bg={tooltipBg}
							shadow='md'
							rounded='md'
							px={3}
							py={2}
							pointerEvents='none'
							fontSize='sm'
						>
							<Text fontWeight='bold'>{shortDate(hoveredDay.date)}</Text>
							<Text>{formatPrice(hoveredDay.revenue)}</Text>
							<Text color={mutedText}>
								{hoveredDay.orders} {hoveredDay.orders === 1 ? "order" : "orders"}
							</Text>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
};
export default SalesChart;
