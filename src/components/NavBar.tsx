import { useLocation } from "@solidjs/router";
import { type Component, type JSX, Show, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import styles from "./modules/Navbar.module.css";

const NavBar: Component = () => {
	const location = useLocation();
	const [open, setOpen] = createSignal(false);

	function retstyles(pathname: string) {
		const anchorStyles: JSX.CSSProperties = {
			"text-decoration": location.pathname === pathname ? "underline" : "none",
		};
		return anchorStyles;
	}

	return (
		<>
			{/* Top navbar (desktop) */}
			<nav class={styles.nav_container}>
				<A href="/" style={retstyles("/")}>
					Chat
				</A>
				<A href="/image" style={retstyles("/image")}>
					Upload
				</A>
				<A href="/signin" style={retstyles("/signin")}>
					Authentication
				</A>
			</nav>

			{/* Mobile hamburger */}
			<button class={styles.hamburger} onClick={() => setOpen(!open())}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 15 15"
				>
					<path
						fill="currentColor"
						fill-rule="evenodd"
						d="M1.5 3a.5.5 0 0 0 0 1h12a.5.5 0 0 0 0-1zM1 7.5a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 0 1h-12a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 0 1h-12a.5.5 0 0 1-.5-.5"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			{/* Overlay (closes sidebar on click) */}
			<Show when={open()} keyed>
				<div class={styles.overlay} onClick={() => setOpen(false)} />
			</Show>
			{/* Sidebar (mobile) */}
			<aside
				class={styles.aside_container}
				onClick={() => setOpen(false)}
				classList={{
					[styles.open]: open(),
				}}
			>
				<A href="/" style={retstyles("/")}>
					Chat
				</A>
				<A href="/image" style={retstyles("/image")}>
					Upload
				</A>
				<A href="/signin" style={retstyles("/signin")}>
					Authentication
				</A>
			</aside>
		</>
	);
};

export default NavBar;
