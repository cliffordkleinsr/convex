import { A } from "@solidjs/router";

export default function Bye() {
	return (
		<>
			<p>Were sad to see you leave</p>
			<p>
				{" "}
				Go back <A href="/">Home</A>
			</p>
		</>
	);
}
