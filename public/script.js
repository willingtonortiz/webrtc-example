const socket = io("/");
const videosContainer = document.getElementById("video-grid");

const createVideoElement = () => document.createElement("video");

const myPeer = new Peer(undefined, {
	host: "/",
	port: "3001"
});

const peers = {};
const myVideo = createVideoElement();
myVideo.muted = true;

myPeer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id);
});

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true
	})
	.then((myStream) => {
		addVideoStream(myVideo, myStream);

		myPeer.on("call", (call) => {
			console.log("Me estan llamando!");
			call.answer(myStream);

			const video = createVideoElement();

			call.on("stream", (remoteStream) => {
				addVideoStream(video, remoteStream);
			});
		});

		socket.on("user-connected", (userId) => {
			console.log("Entro", userId);
			connectToNewUser(userId, myStream);
		});
	});

socket.on("user-disconnected", (userId) => {
	if (peers[userId]) peers[userId].close();
});


function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = createVideoElement();

	console.log("Llamando a " + userId);

	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});

	call.on("close", () => {
		video.remove();
	});

	peers[userId] = call;
}

function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});
	videosContainer.append(video);
}
