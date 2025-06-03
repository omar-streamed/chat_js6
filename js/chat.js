const socket = io("http://192.168.21.113:4000");
const user = JSON.parse(localStorage.getItem("user") || "{}");

let chatId = "";
let activeFriend = null;

const chatList = document.getElementById("chatList");
const userList = document.getElementById("userList");
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

// Function to toggle sidebar open/close
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const openBtn = document.getElementById("openSidebarBtn");

  sidebar.classList.toggle("hidden");

  if (sidebar.classList.contains("hidden")) {
    openBtn.style.display = "block";
  } else {
    openBtn.style.display = "none";
  }
}

// On page load, set openSidebarBtn visibility depending on sidebar state
window.addEventListener("load", () => {
  const sidebar = document.getElementById("sidebar");
  const openBtn = document.getElementById("openSidebarBtn");
  if (!sidebar.classList.contains("hidden")) {
    openBtn.style.display = "none";
  }
});

const scrollToBottom = () => {
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const renderMessage = (msg) => {
  const div = document.createElement("div");
  div.className = `message ${
    msg.senderId === user._id ? "outgoing" : "incoming"
  }`;
  div.textContent = msg.content;
  messagesEl.appendChild(div);
  scrollToBottom();
};

const sendMessage = (e) => {
  e.preventDefault();
  const content = messageInput.value.trim();
  if (!content || !activeFriend) return;

  const msg = {
    chatId,
    senderId: user._id,
    receiverId: activeFriend._id,
    type: "text",
    content,
  };

  socket.emit("send_message", msg, (res) => {
    if (res.status === "success") {
      renderMessage(msg);
    }
  });

  messageInput.value = "";
};

socket.on("new_message", (msg) => {
  console.log("New message received:", msg);
  if (msg.data.chatId === chatId) {
    renderMessage(msg.data);
  }
});

const loadFriends = async () => {
  const res = await fetch(
    `http://192.168.21.113:4000/user/getAll/${user.appName}`,
    {
      headers: {
        Authorization: `Bearer ${user.fcmToken}`,
      },
    }
  );
  const data = await res.json();
  userList.innerHTML = "";
  data.data.forEach((friend) => {
    const div = document.createElement("div");
    div.className = "user-card";
    div.innerHTML = `<img class="avatar-img" src="${
      friend.profileImage || ""
    }" /><div><strong>${friend.name}</strong><br/><small>${
      friend.email
    }</small></div>`;
    div.onclick = async () => {
      try {
        await startChat(friend); // Wait for chat to initialize
        if (window.innerWidth <= 1024) {
          document.getElementById("sidebar").classList.add("hidden"); // Close sidebar
          document.getElementById("openSidebarBtn").style.display = "block"; // Show toggle button
        }
      } catch (err) {
        console.error("Error starting chat:", err);
      }
    };
    userList.appendChild(div);
  });
};

const startChat = async (friend) => {
  if (!friend || !friend._id) return;

  if (chatId) {
    socket.emit("leave-chat", { chatId, senderId: user._id }, (res) => {
      if (res.status === "success") {
        console.log("Left previous chat:", chatId);
      } else {
        console.error("Failed to leave chat:", res.message);
      }
    });
  }
  if (chatId) {
    socket.emit("leave-chat", { chatId, senderId: user._id });
  }
  activeFriend = friend;
  document.getElementById("chatWith").textContent = friend.name;
  messagesEl.innerHTML = "";

  const chatRes = await fetch("http://192.168.21.113:4000/user/createChat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: user._id, other: friend?._id }),
  });
  const chatData = await chatRes.json();
  chatId = chatData.data.chatId;

  socket.emit("join-chat", { chatId, senderId: user._id });

  const msgRes = await fetch(
    `http://192.168.21.113:4000/user/getAllMessages/${chatId}`
  );
  const msgData = await msgRes.json();
  msgData.data.forEach(renderMessage);
};

loadFriends();
