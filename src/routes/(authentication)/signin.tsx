import { action, redirect } from "@solidjs/router";
import { createSignal, JSX, Show } from "solid-js";
import { toast } from "solid-sonner";
import styles from "~/components/modules/Login.module.css";
import { authClient } from "~/lib/auth-client";

export default function SignIn() {
	const [showSignIn, setShowSignIn] = createSignal(true);
	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);

		if (showSignIn()) {
			const { data, error } = await authClient.signIn.email({
					/**
					 * The user email
					 */
					email: formData.get("email") as string,
					/**
					 * The user password
					 */
					password: formData.get("password") as string,
					/**
					 * A URL to redirect to after the user verifies their email (optional)
					 */
					callbackURL: "/authed",
					/**
					 * remember the user session after the browser is closed. 
					 * @default true
					 */
					rememberMe: false
			}, {
				//callbacks
				onError: (ctx) => {
					// window.alert(ctx.error.message)
					toast.error(ctx.error.message);
				},
				onSuccess: () => {
					toast.success("User Logged in");
					// throw redirect("/authed")
				}
			})
		} else {
			const { data, error } = await authClient.signUp.email({
					email: formData.get("email") as string, // user email address
					password: formData.get("password") as string, // user password -> min 8 characters by default
					name: formData.get("name") as string, // user display name
					// image, // User image URL (optional)
					callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
				}, {
					
					onError: (ctx) => {
						// window.alert(ctx.error.message)
						// display the error message
						toast.error(ctx.error.message);
					},
			});
		}
	};
	return (
		<main class={styles.main_container}>
			<section>
				<header>
					<h1>Sign in</h1>
					{/* <p>
						Don't have an account yet?
						
						<a href="../examples/html/signup.html">Sign up here</a>
					</p> */}
				</header>

				<section class="mt-5">
					<button type="button">
						<svg width="46" height="47" viewBox="0 0 46 47" fill="none">
							<path
								d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z"
								fill="#4285F4"
							/>
							<path
								d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z"
								fill="#34A853"
							/>
							<path
								d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z"
								fill="#FBBC05"
							/>
							<path
								d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z"
								fill="#EB4335"
							/>
						</svg>
						Sign in with Google
					</button>

					<div>Or</div>

					{/* Form */}
					<form onSubmit={handleSubmit}>
						<div>
							{/* Form Group */}
							<Show when={!showSignIn()}>
								<div class={styles.input_wrapper}>
									<label for="name">Username</label>
									<input
										type="text"
										id="name"
										name="name"
										required
										aria-describedby="name-error"
									/>
									<div  class={styles.icon}>
										<svg
											width="16"
											height="16"
											fill="currentColor"
											viewBox="0 0 16 16"
											aria-hidden="true"
										>
											<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
										</svg>
									</div>
									<p id="email-error">Please include a valid username</p>
								</div>
							</Show>
							<div>
								<label for="email">Email address</label>
								<div class={styles.input_wrapper}>
									<input
										type="email"
										id="email"
										name="email"
										required
										aria-describedby="email-error"
									/>
									<div class={styles.icon}>
										<svg
											width="16"
											height="16"
											fill="currentColor"
											viewBox="0 0 16 16"
											aria-hidden="true"
										>
											<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
										</svg>
									</div>
								</div>
								<p id="email-error">Please include a valid email address</p>
							</div>
							{/* End Form Group */}

							{/* Form Group */}
							<div>
								<div class={styles.forgot_wrapper}>
									<label for="password">Password</label>
									<a href="../examples/html/recover-account.html">
										Forgot password?
									</a>
								</div>
								<div class={styles.input_wrapper}>
									<input
										type="password"
										id="password"
										name="password"
										required
										aria-describedby="password-error"
									/>
									<div class={styles.icon}>
										<svg
											width="16"
											height="16"
											fill="currentColor"
											viewBox="0 0 16 16"
											aria-hidden="true"
										>
											<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
										</svg>
									</div>
								</div>
								<p id="password-error">8+ characters required</p>
							</div>
							{/* End Form Group */}

							{/* Checkbox */}
							<div class={styles.checkbox_group}>
								<div>
									<input id="remember-me" name="remember-me" type="checkbox" />
								</div>
								<div>
									<label for="remember-me">Remember me</label>
								</div>
							</div>
							{/* End Checkbox */}

							<button type="submit">
								{showSignIn() ? "Sign in" : "Sign up"}
							</button>
						</div>
					</form>
					{/* End Form */}
					<section class={styles.switcher}>
						<p>
							 Don't have an account yet? 
						</p>
						<a onClick={() => setShowSignIn(!showSignIn())}>
							{showSignIn() ? "Sign up" : "Sign in"}
						</a>
					</section>
	
				</section>
			</section>

		</main>
	);
}
