import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Search box in the header. On the home page it filters as you type;
// elsewhere, pressing Enter opens the home page with the results.
const HeaderSearch = ({ onSearch, ...props }) => {
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();
	const isHome = location.pathname === "/";
	const urlQuery = isHome ? searchParams.get("q") || "" : "";
	const [value, setValue] = useState(urlQuery);

	useEffect(() => setValue(urlQuery), [urlQuery]);

	const go = (text) => {
		const params = new URLSearchParams(isHome ? searchParams : undefined);
		if (text.trim()) params.set("q", text.trim());
		else params.delete("q");
		const query = params.toString();
		navigate(query ? `/?${query}` : "/", { replace: isHome });
	};

	// Live search on the home page, after a short pause in typing
	useEffect(() => {
		if (!isHome || value.trim() === urlQuery) return;
		const timer = setTimeout(() => go(value), 300);
		return () => clearTimeout(timer);
	}, [value]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<form
			role='search'
			onSubmit={(e) => {
				e.preventDefault();
				go(value);
				onSearch?.();
			}}
			style={{ width: "100%" }}
		>
			<InputGroup {...props}>
				<InputLeftElement pointerEvents='none' color='text.subtle'>
					<FiSearch />
				</InputLeftElement>
				<Input
					type='search'
					aria-label='Search books'
					placeholder='Search by title or author'
					value={value}
					onChange={(e) => setValue(e.target.value)}
					bg='bg.canvas'
					borderColor='border.subtle'
					rounded='full'
				/>
			</InputGroup>
		</form>
	);
};
export default HeaderSearch;
