import { Title } from "@solidjs/meta";
import { faker } from "@faker-js/faker";
import { createEffect, createSignal, For, Index, on, onMount } from "solid-js";
import styles from "~/components/modules/Chat.module.css";
import { createMutation, createQuery } from "~/components/solid-convex";
import { api } from "../../../convex/_generated/api";

type Messeges = {
	_id: string;
	user: string;
	body: string;
	_creationTime: Date;
};
export default function Home() {
	const [name, setName] = createSignal("");
	// fetch messages
	const messages = createQuery<Messeges[]>(api.chat.getMessages);
	// expand search bar
	const [expanded, setExpanded] = createSignal(false);
	const [searchText, setSearchText] = createSignal("");
	// use a memo to recompute the query args
	const searchResults = createQuery<Messeges[]>(api.chat.searchResults, () => ({
		query: searchText(),
	}));

	// send messages
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
			<div
				class={styles.search}
				classList={{ [styles.expanded]: expanded() }}
				onClick={() => setExpanded(!expanded())}
			>
				<h2>Search Messages</h2>
				<input
					value={searchText()}
					onClick={(event) => event.stopPropagation()}
					onChange={(event) => setSearchText(event.target.value)}
					placeholder="Search!"
				/>
				<ul>
					<For each={searchResults()}>
						{(searchResult) => (
							<li>
								<span>{searchResult.user}:</span>
								<span class={styles.text_wrapper}>{searchResult.body}</span>
								<span>
									{new Date(searchResult._creationTime).toLocaleTimeString()}
								</span>
							</li>
						)}
					</For>
				</ul>
			</div>
		</main>
	);
}
