import { Title } from "@solidjs/meta";
import { faker } from "@faker-js/faker";
import {
	Accessor,
	Component,
	createEffect,
	createSignal,
	Index,
	on,
	onMount,
} from "solid-js";
import styles from "~/components/modules/Chat.module.css";
import { createMutation, createQuery } from "~/components/solid-convex";
import { api } from "../../convex/_generated/api";
import { A } from "@solidjs/router";

type Messeges = {
	_id: string;
	user: string;
	body: string;
};
export default function Home() {
	const [name, setName] = createSignal("");

	const messages = createQuery<Messeges[]>(api.chat.getMessages);
	const sendMessage = createMutation(api.chat.sendMessage);
	onMount(() => {
		const NAME_KEY = "tutorial_name";
		let storedName = sessionStorage.getItem(NAME_KEY);
		if (!storedName) {
			storedName = faker.person.firstName();
			sessionStorage.setItem(NAME_KEY, storedName);
		}
		setName(storedName);
	});

	const [newMessage, setNewMessage] = createSignal("");
	let mainEl: HTMLElement | undefined;
	createEffect(
		on(
			[messages, newMessage],
			() => {
				if (!mainEl) return;
				setTimeout(() => {
					window.scrollTo({
						top: mainEl.scrollHeight,
						behavior: "smooth",
					});
				}, 0);
			},

			{ defer: true },
		),
	);

	return (
		<main class={styles.chat} ref={mainEl}>
			<Title>Hello World</Title>
			<header>
				<h1> Convex Chat</h1>
				<p>
					Connected as <strong>{name()}</strong>
				</p>
				<nav>
					<A href="/">Chat Example</A>
					<A href="/image">Upload Example</A>
				</nav>
			</header>
			<section>
				<Index each={messages()}>
					{(message) => (
						<article
							classList={{
								[styles.message_mine]: message().user === name(),
							}}
						>
							<div>{message().user}</div>
							<p>{message().body}</p>
						</article>
					)}
				</Index>
			</section>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					await sendMessage({
						user: name(),
						body: newMessage(),
					});
					setNewMessage("");
				}}
			>
				<input
					value={newMessage()}
					onChange={(e) => {
						const text = e.target.value;
						setNewMessage(text);
					}}
					placeholder="Write a message…"
					autofocus
				/>
				<button type="submit" disabled={!newMessage()}>
					Send
				</button>
			</form>
		</main>
	);
}
