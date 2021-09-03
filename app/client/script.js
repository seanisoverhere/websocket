let displayName = "";
let users = {};

const DisplayNameInput = document.getElementById("displayNameInput");
const LoginContainer = document.getElementById("loginContainer");
const AppContainer = document.getElementById("appContainer");
const messageInput = document.getElementById("messageInput");
const messageContainer = document.getElementById("messageContainer");

const allUsersHTML = (users) => {
  htmlOutput = "";
  for (const user of Object.values(users)) {
    htmlOutput += `<span class="badge rounded-pill bg-primary">${user.displayName}</span>`;
  }
  return htmlOutput;
};

const enterDisplayName = () => {
  if (DisplayNameInput.value.length > 3) {
    displayName = DisplayNameInput.value;
    LoginContainer.classList.toggle("d-none");
    AppContainer.classList.toggle("d-none");
    // connect to socket server
    socket.auth = {
      displayName,
    };
    socket.connect();
  } else {
    alert("Enter a longer name");
  }
};

const renderNewMessage = (messageObj) => {
  messageContainer.innerHTML += `<p>${messageObj.displayName} : ${messageObj.message}</p>`;
};

const sendMessage = (event) => {
  event.preventDefault();
  if (messageInput.value.length > 0) {
    const messageObj = {
      displayName,
      message: messageInput.value
    };
    socket.emit("USER_NEW_MESSAGE", messageObj);
    renderNewMessage(messageObj);
    messageInput.value = "";
  }
  return false;
};

const socket = io("", {
  autoConnect: false,
  transport: ["websocket"],
});

socket.on("ALL_USERS", (allUsers) => {
  users = allUsers;
  userContainer.innerHTML = allUsersHTML(users);
});

// someone else connected
socket.on("NEW_USER_CONNECTED", (newUser) => {
  users[newUser.socketId] = newUser;
  userContainer.innerHTML = allUsersHTML(users);
});

// someone else disconnected
socket.on("USER_DISCONNECTED", (id) => {
  delete users[id];
  userContainer.innerHTML = allUsersHTML(users);
});

// someone else sends a message
socket.on("USER_NEW_MESSAGE_FROM_SERVER", renderNewMessage);