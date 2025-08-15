import {
	type Component,
	createEffect,
	createSignal,
	For,
	Index,
	onMount,
} from "solid-js";
import styles from "~/components/modules/Image.module.css";
import { createMutation, createQuery } from "~/components/solid-convex";
import { api } from "../../convex/_generated/api";
import { faker } from "@faker-js/faker";
import { A } from "@solidjs/router";

export default function ImageUpload() {
	const [selectedImage, setSelectedImage] = createSignal<File | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);

	const generateUploadUrl = createMutation<Promise<string>>(
		api.chat.generateUploadUrl,
	);

	const imageList = createQuery<any>(api.chat.fetchGallery);
	const sendImg = createMutation(api.chat.sendImage);
	let inputEL: HTMLInputElement | undefined;
	const [name, setName] = createSignal("");

	onMount(() => {
		if (!inputEL) return;
		const NAME_KEY = "tutorial_name";
		let storedName = sessionStorage.getItem(NAME_KEY);
		if (!storedName) {
			storedName = faker.person.firstName();
			sessionStorage.setItem(NAME_KEY, storedName);
		}
		setName(storedName);
	});

	createEffect(() => console.log(imageList()));

	return (
		<>
			<nav
				style={{
					display: "flex",
					"justify-content": "flex-end",
					padding: "5ch 3ch",
					gap: "10px",
				}}
			>
				<A href="/">Chat Example</A>
				<A href="/image">Upload Example</A>
			</nav>
			<section class={styles.container}>
				<p>
					Connected as <strong>{name()}</strong>
				</p>
				<header>
					<h1>Upload Images</h1>
					<p>Example showing how to upload images</p>
				</header>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						if (!selectedImage()) return;
						setIsLoading(true); // start loading
						try {
							// Step 1: Get a short-lived upload URL
							const postURL = await generateUploadUrl();
							// Step 2: POST the file to the URL
							const result = await fetch(postURL, {
								method: "POST",
								headers: { "Content-Type": selectedImage()!.type },
								body: selectedImage(),
							});
							const { storageId } = await result.json();
							// Step 3: Save the newly allocated storage id to the database
							await sendImg({ storageId, author: name() });
							setSelectedImage(null);
							inputEL!.value = "";
						} finally {
							setIsLoading(false); // stop loading
						}
					}}
					enctype="multipart/form-data"
				>
					<input
						type="file"
						accept="image/*"
						ref={inputEL}
						size={1000}
						onChange={(e) => {
							setSelectedImage(e.target.files![0]);
						}}
						disabled={selectedImage() !== null && isLoading()}
					/>
					<button
						disabled={selectedImage() === null || isLoading()}
						type="submit"
					>
						{isLoading() ? <Loading /> : "Send Image"}
					</button>
				</form>
			</section>
			<main class={styles.images}>
				<p>Gallery</p>
				<For each={imageList()}>{(images) => <Image gallery={images} />}</For>
			</main>
		</>
	);
}

type Gallery = {
	_id: string;
	url: string;
	storageId: string;
};
const Image: Component<{
	gallery: Gallery;
}> = ({ gallery }) => {
	const deleteById = createMutation(api.chat.deleteImgId);
	return (
		<div>
			<img src={gallery.url} />
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					const storageId = formData.get("storageId") as string;
					const id = formData.get("id") as string;
					await deleteById({ storageId, id });
				}}
			>
				<input name="storageId" type="text" value={gallery.storageId} hidden />
				<input name="id" type="text" value={gallery._id} hidden />
				<button type="submit">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"
						/>
					</svg>
				</button>
			</form>
		</div>
	);
};

const Loading: Component<{}> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
		>
			<path
				fill="currentColor"
				d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
				opacity="0.5"
			/>
			<path
				fill="currentColor"
				d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
			>
				<animateTransform
					attributeName="transform"
					dur="1s"
					from="0 12 12"
					repeatCount="indefinite"
					to="360 12 12"
					type="rotate"
				/>
			</path>
		</svg>
	);
};
