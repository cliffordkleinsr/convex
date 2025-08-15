import { createEffect, createSignal, Index, onMount } from "solid-js";
import styles from "~/components/modules/Image.module.css";
import { createMutation, createQuery } from "~/components/solid-convex";
import { api } from "../../convex/_generated/api";
import { faker } from "@faker-js/faker";
export default function ImageUpload() {
	const [selectedImage, setSelectedImage] = createSignal<File | null>(null);
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

	// createEffect(() => console.log(imageList()))
	return (
		<>
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
						disabled={!!selectedImage()}
					/>
					<button disabled={!selectedImage()} type="submit">
						Send Image
					</button>
				</form>
			</section>
			<main class={styles.images}>
				<p>Gallery</p>
				<Index each={imageList()}>
					{(images) => <Image gallery={images()} />}
				</Index>
				{/* <Image src="https://images.unsplash.com/photo-1656618724305-a4257e46e847?q=80&w=320&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Project"></img>
            <Image src="https://images.unsplash.com/photo-1616427592793-67b858804534?q=80&w=320&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Project"></img> */}
			</main>
		</>
	);
}

import { Component } from "solid-js";
type Gallery = {
	url: string;
};
const Image: Component<{
	gallery: Gallery;
}> = ({ gallery }) => {
	return <img src={gallery.url} />;
};
