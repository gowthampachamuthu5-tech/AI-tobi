
/* =========================================
   AI TOBI - JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  const activateBtn = document.getElementById("activateBtn");
  const activateText = document.getElementById("activateText");
  const voiceStatus = document.getElementById("voiceStatus");
  const orbStatus = document.getElementById("orbStatus");
  const orbStage = document.getElementById("orbStage");

  const yearElement = document.getElementById("year");

  // Automatically update the footer year
  yearElement.textContent = new Date().getFullYear();

  // Mobile navigation
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  // Close the mobile menu after clicking a link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  // Highlight the selected navigation link
  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  // Browser speech recognition support
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  let recognition = null;
  let isListening = false;

  // Text-to-speech helper
  function speak(text) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1.05;

    window.speechSynthesis.speak(utterance);
  }

  // Update the assistant interface
  function updateAssistant(status, message, listening = false) {
    orbStatus.textContent = status;
    voiceStatus.lastChild.textContent = message;

    voiceStatus.classList.toggle("listening", listening);
    orbStage.classList.toggle("is-listening", listening);

    activateText.textContent = listening
      ? "Listening..."
      : "Activate Tobi";

    activateBtn.setAttribute(
      "aria-pressed",
      String(listening)
    );
  }

  // Create a voice recognition session
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;

      updateAssistant(
        "LISTENING",
        "Tobi is listening. Speak now...",
        true
      );
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();

      if (!transcript) {
        updateAssistant("SYSTEM READY", "No speech detected.");
        return;
      }

      updateAssistant(
        "VOICE RECEIVED",
        `You said: "${transcript}"`
      );

      // Demo response: repeats what the user said.
      // Connect an AI backend for intelligent answers.
      speak(`I heard you say: ${transcript}`);
    };

    recognition.onerror = (event) => {
      const messages = {
        "not-allowed":
          "Microphone permission denied. Allow microphone access.",
        "no-speech":
          "No speech detected. Please try again.",
        "audio-capture":
          "No microphone was detected.",
        "network":
          "Speech recognition needs a network connection."
      };

      updateAssistant(
        "VOICE UNAVAILABLE",
        messages[event.error] ||
          "Voice recognition failed. Please try again."
      );
    };

    recognition.onend = () => {
      isListening = false;

      voiceStatus.classList.remove("listening");
      orbStage.classList.remove("is-listening");

      activateText.textContent = "Activate Tobi";
      activateBtn.setAttribute("aria-pressed", "false");

      if (orbStatus.textContent === "LISTENING") {
        orbStatus.textContent = "SYSTEM STANDBY";
        voiceStatus.lastChild.textContent = "Ready when you are";
      }
    };
  }

  // Activate the assistant
  activateBtn.addEventListener("click", () => {
    if (isListening && recognition) {
      recognition.stop();
      return;
    }

    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        updateAssistant(
          "PLEASE WAIT",
          "Voice recognition is restarting. Try again shortly."
        );
      }

      return;
    }

    // Fallback when speech recognition is unavailable
    updateAssistant(
      "VOICE INPUT UNAVAILABLE",
      "Your browser does not support speech recognition."
    );

    speak(
      "Hello! I am Tobi, your personal assistant interface. " +
      "Voice input is not supported in this browser."
    );
  });

  // Make the orb react when the pointer moves over it
  orbStage.addEventListener("pointermove", (event) => {
    if (isListening) return;

    const rect = orbStage.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    orbStage.style.setProperty(
      "--pointer-x",
      `${x * 10}px`
    );

    orbStage.style.setProperty(
      "--pointer-y",
      `${y * 10}px`
    );
  });

  orbStage.addEventListener("pointerleave", () => {
    orbStage.style.setProperty("--pointer-x", "0px");
    orbStage.style.setProperty("--pointer-y", "0px");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const micButton = document.getElementById("micButton");
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const clearButton = document.getElementById("clearButton");

  const voiceVisual = document.getElementById("voiceVisual");
  const systemStatus = document.getElementById("systemStatus");
  const onlineText = document.getElementById("onlineText");
  const listeningTitle = document.getElementById("listeningTitle");
  const listeningDescription =
    document.getElementById("listeningDescription");

  const transcriptContent =
    document.getElementById("transcriptContent");

  const textForm = document.getElementById("textForm");
  const textInput = document.getElementById("textInput");

  document.getElementById("year").textContent =
    new Date().getFullYear();

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  let recognition = null;
  let isListening = false;
  let isSpeaking = false;
  let shouldRestart = false;

  // -------------------------------------
  // Update the assistant interface
  // -------------------------------------

  function setStatus(title, description, state = "ready") {
    listeningTitle.textContent = title;
    listeningDescription.textContent = description;

    systemStatus.textContent =
      state === "listening" ? "LISTENING" :
      state === "speaking" ? "SPEAKING" :
      state === "error" ? "CHECK MICROPHONE" :
      "SYSTEM READY";

    onlineText.textContent =
      state === "listening" ? "LISTENING" :
      state === "speaking" ? "SPEAKING" :
      state === "error" ? "UNAVAILABLE" :
      "STANDBY";

    voiceVisual.classList.toggle(
      "is-listening",
      state === "listening"
    );

    voiceVisual.classList.toggle(
      "is-speaking",
      state === "speaking"
    );

    micButton.setAttribute(
      "aria-pressed",
      String(state === "listening")
    );

    micButton.setAttribute(
      "aria-label",
      state === "listening"
        ? "Stop listening"
        : "Start listening"
    );

    startButton.disabled = state === "listening";
    stopButton.disabled =
      state !== "listening" && state !== "speaking";
  }

  // -------------------------------------
  // Add a message to the transcript
  // -------------------------------------

  function addMessage(sender, message) {
    const article = document.createElement("div");
    article.className =
      "transcript-message " +
      (sender === "YOU" ? "user-message" : "assistant-message");

    const icon = document.createElement("span");
    icon.className = "message-icon";
    icon.textContent = sender === "YOU" ? "Y" : "T";

    const content = document.createElement("div");

    const label = document.createElement("span");
    label.className = "message-label";
    label.textContent = sender === "YOU" ? "YOU" : "TOBI";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    content.append(label, paragraph);
    article.append(icon, content);

    transcriptContent.appendChild(article);
    transcriptContent.scrollTop = transcriptContent.scrollHeight;
  }

  // -------------------------------------
  // Text-to-speech
  // -------------------------------------

  function speak(message) {
    if (!("speechSynthesis" in window)) {
      setStatus(
        "Response ready",
        "Your browser does not support spoken responses."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      isSpeaking = true;

      if (!isListening) {
        setStatus("Tobi is speaking", message, "speaking");
      }
    };

    utterance.onend = () => {
      isSpeaking = false;

      if (!isListening) {
        setStatus("Ready to listen", "Ask Tobi another question.");
      }
    };

    utterance.onerror = () => {
      isSpeaking = false;

      if (!isListening) {
        setStatus(
          "Response ready",
          "Speech playback was interrupted."
        );
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  // -------------------------------------
  // Local demo command processor
  // -------------------------------------

  function processCommand(rawText) {
    const text = rawText.trim();

    if (!text) return;

    addMessage("YOU", text);

    const query = text.toLowerCase().replace(/[.!?]+$/g, "");
    let reply;

    if (/\b(hello|hi|hey)\b/.test(query)) {
      reply = "Hello! I am Tobi, your personal assistant. How can I help you today?";
    } else if (
      query.includes("your name") ||
      query.includes("who are you")
    ) {
      reply = "My name is Tobi. I am your digital assistant interface.";
    } else if (
      query.includes("what time") ||
      query === "time"
    ) {
      reply = "The current time is " +
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit"
        });
    } else if (
      query.includes("today's date") ||
      query.includes("todays date") ||
      query.includes("what is the date") ||
      query.includes("what day")
    ) {
      reply = "Today is " +
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
    } else if (
      query.includes("fun fact") ||
      query.includes("tell me a fact")
    ) {
      reply = "Here is a fun fact. A day on Venus is longer than its year because Venus rotates very slowly.";
    } else if (
      query.includes("thank you") ||
      query.includes("thanks")
    ) {
      reply = "You are welcome! I am always ready to help.";
    } else if (
      query.includes("stop speaking") ||
      query.includes("be quiet")
    ) {
      window.speechSynthesis?.cancel();
      isSpeaking = false;
      reply = "Okay. I will be quiet.";
    } else if (
      query.includes("help") ||
      query.includes("what can you do")
    ) {
      reply = "In this demo, I can greet you, tell you the current time and date, and share a fun fact. Connect an AI backend for more advanced answers.";
    } else {
      reply = "I heard you say: " + text +
        ". This is the local demo mode. Connect an AI service to answer general questions intelligently.";
    }

    addMessage("TOBI", reply);
    speak(reply);
  }

  // -------------------------------------
  // Speech recognition setup
  // -------------------------------------

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;

      setStatus(
        "Listening to you...",
        "Speak clearly. Tobi is listening.",
        "listening"
      );
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const words = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += words;
        } else {
          interimTranscript += words;
        }
      }

      if (interimTranscript && !finalTranscript) {
        listeningDescription.textContent = interimTranscript;
      }

      if (finalTranscript.trim()) {
        isListening = false;
        processCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      isListening = false;
      shouldRestart = false;

      const errors = {
        "not-allowed":
          "Allow microphone access in your browser settings.",
        "service-not-allowed":
          "The browser blocked speech recognition.",
        "no-speech":
          "No speech detected. Try speaking again.",
        "audio-capture":
          "No microphone was found. Check your device.",
        "network":
          "Speech recognition needs a working network connection.",
        "language-not-supported":
          "This browser does not support the selected language."
      };

      setStatus(
        "Voice input unavailable",
        errors[event.error] ||
          "Something went wrong. Please try again.",
        "error"
      );
    };

    recognition.onend = () => {
      isListening = false;

      if (shouldRestart) {
        shouldRestart = false;
        startListening();
        return;
      }

      if (!isSpeaking) {
        setStatus(
          "Ready to listen",
          "Press the microphone to speak again."
        );
      }
    };
  } else {
    setStatus(
      "Voice input unavailable",
      "Try typing a message below or use a supported browser.",
      "error"
    );
  }

  // -------------------------------------
  // Start listening
  // -------------------------------------

  function startListening() {
    if (!recognition) {
      setStatus(
        "Voice input unavailable",
        "Use the text box below to communicate with Tobi.",
        "error"
      );
      return;
    }

    if (isListening) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    isSpeaking = false;
    shouldRestart = false;

    try {
      recognition.start();
    } catch (error) {
      setStatus(
        "Please wait",
        "Voice recognition is restarting. Try again shortly."
      );
    }
  }

  function stopAssistant() {
    shouldRestart = false;

    if (recognition && isListening) {
      recognition.stop();
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    isListening = false;
    isSpeaking = false;

    setStatus("Assistant stopped", "Press Start Listening to continue.");
  }

  // -------------------------------------
  // Button controls
  // -------------------------------------

  micButton.addEventListener("click", () => {
    if (isListening) {
      stopAssistant();
    } else {
      startListening();
    }
  });

  startButton.addEventListener("click", startListening);
  stopButton.addEventListener("click", stopAssistant);

  // -------------------------------------
  // Text input fallback
  // -------------------------------------

  textForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = textInput.value.trim();

    if (!message) return;

    if (isListening || isSpeaking) {
      stopAssistant();
    }

    textInput.value = "";
    processCommand(message);
  });

  // -------------------------------------
  // Quick command buttons
  // -------------------------------------

  document.querySelectorAll(".command-chip").forEach((button) => {
    button.addEventListener("click", () => {
      if (isListening || isSpeaking) {
        stopAssistant();
      }

      processCommand(button.dataset.command);
    });
  });

  // -------------------------------------
  // Clear transcript
  // -------------------------------------

  clearButton.addEventListener("click", () => {
    transcriptContent.replaceChildren();
    addMessage(
      "TOBI",
      "Transcript cleared. I am ready for your next command."
    );
  });

  // Initial interface
  setStatus(
    "Ready to listen",
    recognition
      ? "Press the microphone and say something."
      : "Voice input is unavailable. You can type a message instead."
  );
});

document.addEventListener("DOMContentLoaded", () => {
  const chatFeed = document.getElementById("chatFeed");
  const welcomeScreen = document.getElementById("welcomeScreen");
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const clearButton = document.getElementById("clearButton");
  const newChatButton = document.getElementById("newChatButton");
  const characterCount = document.getElementById("characterCount");
  const recentChats = document.getElementById("recentChats");
  const sidebar = document.getElementById("sidebar");
  const menuButton = document.getElementById("menuButton");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const connectionStatus = document.getElementById("connectionStatus");

  let chats = [];
  let activeChatId = null;
  let nextChatId = 1;
  let isGenerating = false;
  let generationToken = 0;

  // ---------------------------------------
  // Create a conversation
  // ---------------------------------------

  function createChat() {
    const chat = {
      id: nextChatId++,
      title: "New conversation",
      messages: []
    };

    chats.unshift(chat);
    activeChatId = chat.id;

    renderRecentChats();
    renderChat();

    messageInput.focus();
    closeSidebar();

    return chat;
  }

  function getActiveChat() {
    return chats.find(chat => chat.id === activeChatId);
  }

  // ---------------------------------------
  // Recent conversations
  // ---------------------------------------

  function renderRecentChats() {
    recentChats.replaceChildren();

    if (chats.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No conversations yet";
      empty.style.cssText =
        "padding:8px;color:#657b96;font-size:11px";
      recentChats.appendChild(empty);
      return;
    }

    chats.forEach(chat => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "recent-chat" +
        (chat.id === activeChatId ? " active" : "");

      const icon = document.createElement("span");
      icon.textContent = "◌";

      const title = document.createElement("span");
      title.className = "recent-title";
      title.textContent = chat.title;

      button.append(icon, title);

      button.addEventListener("click", () => {
        generationToken++;
        isGenerating = false;
        activeChatId = chat.id;
        renderRecentChats();
        renderChat();
        closeSidebar();
      });

      recentChats.appendChild(button);
    });
  }

  // ---------------------------------------
  // Render a conversation
  // ---------------------------------------

  function renderChat() {
    const chat = getActiveChat();
    chatFeed.replaceChildren();

    if (!chat || chat.messages.length === 0) {
      chatFeed.appendChild(welcomeScreen);
      welcomeScreen.hidden = false;
      return;
    }

    welcomeScreen.hidden = true;

    chat.messages.forEach(message => {
      chatFeed.appendChild(
        createMessageElement(message.role, message.text, message.time)
      );
    });

    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // ---------------------------------------
  // Safely create message elements
  // ---------------------------------------

  function createMessageElement(role, text, time = new Date()) {
    const row = document.createElement("article");
    row.className = "message-row " + role;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "Y" : "T";

    const main = document.createElement("div");
    main.className = "message-main";

    const header = document.createElement("div");
    header.className = "message-header";

    const name = document.createElement("span");
    name.className = "message-name";
    name.textContent = role === "user" ? "You" : "Tobi";

    const timestamp = document.createElement("span");
    timestamp.className = "message-time";
    timestamp.textContent = formatTime(time);

    header.append(name, timestamp);

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    // Use textContent to prevent messages from injecting HTML.
    bubble.textContent = text;

    main.append(header, bubble);
    row.append(avatar, main);

    return row;
  }

  function formatTime(value) {
    const date = new Date(value);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // ---------------------------------------
  // Add messages
  // ---------------------------------------

  function addMessage(role, text) {
    const chat = getActiveChat();
    if (!chat) return;

    const message = {
      role,
      text,
      time: new Date()
    };

    chat.messages.push(message);

    if (chat.title === "New conversation" && role === "user") {
      chat.title = text.length > 25
        ? text.slice(0, 25) + "..."
        : text;

      renderRecentChats();
    }

    welcomeScreen.hidden = true;

    const element = createMessageElement(
      message.role,
      message.text,
      message.time
    );

    chatFeed.appendChild(element);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // ---------------------------------------
  // Typing indicator
  // ---------------------------------------

  function showTypingIndicator() {
    const row = document.createElement("article");
    row.className = "message-row";
    row.id = "typingIndicator";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "T";

    const main = document.createElement("div");
    main.className = "message-main";

    const header = document.createElement("div");
    header.className = "message-header";

    const name = document.createElement("span");
    name.className = "message-name";
    name.textContent = "Tobi";

    const label = document.createElement("span");
    label.className = "message-time";
    label.textContent = "thinking...";

    header.append(name, label);

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const dots = document.createElement("div");
    dots.className = "typing-indicator";

    for (let i = 0; i < 3; i++) {
      dots.appendChild(document.createElement("span"));
    }

    const text = document.createElement("span");
    text.className = "typing-label";
    text.textContent = "Tobi is thinking";

    dots.appendChild(text);
    bubble.appendChild(dots);
    main.append(header, bubble);
    row.append(avatar, main);
    chatFeed.appendChild(row);

    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function removeTypingIndicator() {
    document.getElementById("typingIndicator")?.remove();
  }

  // ---------------------------------------
  // Demo response engine
  // ---------------------------------------

  function getDemoResponse(input) {
    const text = input.toLowerCase().trim();

    if (/\b(hello|hi|hey|good morning|good evening)\b/.test(text)) {
      return "Hello! 👋 I'm Tobi, your personal AI assistant. What would you like to explore today?";
    }

    if (
      text.includes("your name") ||
      text.includes("who are you")
    ) {
      return "I'm Tobi, a personal assistant interface designed to help with ideas, learning, coding, and everyday tasks.";
    }

    if (
      text.includes("what time") ||
      text === "time"
    ) {
      return "The current time is " +
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit"
        }) + ".";
    }

    if (
      text.includes("today's date") ||
      text.includes("todays date") ||
      text.includes("what date") ||
      text.includes("what day")
    ) {
      return "Today is " +
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }) + ".";
    }

    if (
      text.includes("artificial intelligence") ||
      text.includes("what is ai")
    ) {
      return "Artificial intelligence (AI) is technology that allows computers to perform tasks such as understanding language, recognizing patterns, and generating content. AI assistants use models to process requests and create responses.";
    }

    if (
      text.includes("website") ||
      text.includes("html") ||
      text.includes("javascript") ||
      text.includes("css") ||
      text.includes("code")
    ) {
      return "Let's build it step by step!\n\n1. HTML creates the website structure.\n2. CSS controls the design, colors, and layout.\n3. JavaScript adds interaction and behavior.\n\nTell me what feature you want to build, and I can help you plan the implementation. This interface is currently running in demo mode.";
    }

    if (
      text.includes("fun fact") ||
      text.includes("tell me a fact")
    ) {
      return "Here's a fun fact: octopuses have three hearts, and two of them pump blood to the gills.";
    }

    if (
      text.includes("thank you") ||
      text.includes("thanks")
    ) {
      return "You're welcome! 😊 I'm happy to help. What shall we work on next?";
    }

    if (
      text.includes("what can you do") ||
      text.includes("help me")
    ) {
      return "I can demonstrate greetings, answer a few built-in questions, show the current date and time, and offer basic coding guidance. To answer a wide range of questions, I need to be connected to a real AI model through a secure backend.";
    }

    if (
      text.includes("who created you") ||
      text.includes("who made you")
    ) {
      return "I'm the Tobi assistant demo built for this website. My responses currently come from a small local set of example rules, not a connected AI model.";
    }

    return "Thanks for your message! I'm currently running in demo mode, so I don't yet have a connected AI model to understand every question. Connect Tobi to an AI backend to enable intelligent, context-aware answers.";
  }

  // ---------------------------------------
  // Send a message
  // ---------------------------------------

  function sendMessage(rawText) {
    const text = rawText.trim();

    if (!text || isGenerating) return;

    if (!getActiveChat()) {
      createChat();
    }

    messageInput.value = "";
    updateComposer();

    addMessage("user", text);

    const currentChatId = activeChatId;
    const token = ++generationToken;

    isGenerating = true;
    sendButton.disabled = true;
    connectionStatus.textContent = "THINKING";

    showTypingIndicator();

    // Demo delay to simulate an AI response.
    window.setTimeout(() => {
      if (token !== generationToken) return;

      removeTypingIndicator();

      // Ignore a response if the user has switched conversations.
      if (activeChatId !== currentChatId) {
        isGenerating = false;
        sendButton.disabled = false;
        connectionStatus.textContent = "DEMO MODE";
        return;
      }

      const reply = getDemoResponse(text);
      addMessage("assistant", reply);

      isGenerating = false;
      sendButton.disabled = false;
      connectionStatus.textContent = "DEMO MODE";
      messageInput.focus();
    }, 700 + Math.min(text.length * 8, 900));
  }

  // ---------------------------------------
  // Composer controls
  // ---------------------------------------

  function updateComposer() {
    const length = messageInput.value.length;

    characterCount.textContent = `${length} / 4000`;
    sendButton.disabled = length === 0 || isGenerating;

    messageInput.style.height = "auto";
    messageInput.style.height =
      Math.min(messageInput.scrollHeight, 140) + "px";
  }

  messageInput.addEventListener("input", updateComposer);

  chatForm.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(messageInput.value);
  });

  messageInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();

      if (!isGenerating) {
        chatForm.requestSubmit();
      }
    }
  });

  // ---------------------------------------
  // Quick prompt cards
  // ---------------------------------------

  document.querySelectorAll(".suggestion-card").forEach(button => {
    button.addEventListener("click", () => {
      sendMessage(button.dataset.prompt || "");
    });
  });

  // ---------------------------------------
  // New chat and clear chat
  // ---------------------------------------

  newChatButton.addEventListener("click", () => {
    generationToken++;
    isGenerating = false;
    sendButton.disabled = false;
    connectionStatus.textContent = "DEMO MODE";
    createChat();
    messageInput.focus();
  });

  clearButton.addEventListener("click", () => {
    generationToken++;
    isGenerating = false;
    sendButton.disabled = false;
    connectionStatus.textContent = "DEMO MODE";

    const chat = getActiveChat();

    if (chat) {
      chat.messages = [];
      chat.title = "New conversation";
    }

    renderRecentChats();
    renderChat();
    updateComposer();
    messageInput.focus();
  });

  // ---------------------------------------
  // Sidebar navigation
  // ---------------------------------------

  function openSidebar() {
    sidebar.classList.add("open");
    mobileOverlay.classList.add("show");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("show");
  }

  menuButton.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  mobileOverlay.addEventListener("click", closeSidebar);

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;

      if (view === "chat") {
        closeSidebar();
        return;
      }

      // These sections can be linked when they are added to the project.
      const target = {
        voice: "assistant",
        dashboard: "dashboard"
      }[view];

      const targetElement = document.getElementById(target);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        closeSidebar();
      } else {
        connectionStatus.textContent =
          view === "voice" ? "VOICE SECTION NOT ADDED" :
          "DASHBOARD NOT ADDED";

        window.setTimeout(() => {
          connectionStatus.textContent = "DEMO MODE";
        }, 2000);
      }
    });
  });

  // ---------------------------------------
  // Initialize
  // ---------------------------------------

  updateComposer();

  const welcomeChat = {
    id: nextChatId++,
    title: "Welcome to Tobi",
    messages: []
  };

  chats.push(welcomeChat);
  activeChatId = welcomeChat.id;

  renderRecentChats();
  renderChat();
});

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const sidebar = $("#sidebar");
  const menuButton = $("#menuButton");
  const modalBackdrop = $("#modalBackdrop");
  const modalTitle = $("#modalTitle");
  const modalDescription = $("#modalDescription");
  const modalSymbol = $("#modalSymbol");
  const modalContent = $("#modalContent");
  const modalAction = $("#modalAction");
  const toast = $("#toast");

  let toastTimer;
  let activeModalAction = null;
  let taskCount = 24;
  let interactionCount = 128;
  let savedNote = "";

  // LIVE DATE AND TIME
  function updateClock() {
    const now = new Date();

    $("#topDate").textContent = now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    $("#year").textContent = now.getFullYear();
  }

  updateClock();
  window.setInterval(updateClock, 60000);

  // TOAST NOTIFICATION
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // MODAL CONTROLS
  function openModal({
    title,
    description,
    symbol = "✧",
    content = "",
    actionLabel = "Done",
    onAction = null
  }) {
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalSymbol.textContent = symbol;
    modalContent.replaceChildren();

    if (typeof content === "string" && content) {
      const paragraph = document.createElement("p");
      paragraph.textContent = content;
      paragraph.style.cssText =
        "margin-top:14px;color:var(--muted);line-height:1.7";
      modalContent.appendChild(paragraph);
    } else if (content instanceof Node) {
      modalContent.appendChild(content);
    }

    modalAction.textContent = actionLabel;
    activeModalAction = onAction;
    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    modalAction.focus();
  }

  function closeModal() {
    modalBackdrop.hidden = true;
    document.body.style.overflow = "";
    activeModalAction = null;
  }

  $("#modalClose").addEventListener("click", closeModal);

  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalBackdrop.hidden) {
      closeModal();
    }
  });

  modalAction.addEventListener("click", () => {
    const action = activeModalAction;

    if (action) {
      const result = action();

      if (result === false) return;
    }

    closeModal();
  });

  // MOBILE SIDEBAR
  menuButton.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  $$(".nav-link[href]").forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");

      $$(".nav-link[href]").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 760 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      sidebar.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });

  // ANIMATED ACTIVITY CHART
  const chartLine = $("#chartLine");
  const chartArea = $("#chartArea");
  const chartPoints = $("#chartPoints");
  const chartLabels = $("#chartLabels");
  const chartRange = $("#chartRange");

  function renderChart(range = 7) {
    const isWeekly = String(range) === "7";

    const values = isWeekly
      ? [32, 48, 40, 72, 56, 84, 67, 94]
      : [25, 43, 36, 61, 48, 77, 60, 87];

    const labels = isWeekly
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Now"]
      : ["-11h", "-9h", "-7h", "-5h", "-3h", "-2h", "-1h", "Now"];

    const width = 700;
    const height = 220;
    const topPadding = 10;
    const bottomPadding = 12;
    const usableHeight = height - topPadding - bottomPadding;

    const points = values.map((value, index) => ({
      x: (index / (values.length - 1)) * width,
      y: topPadding + ((100 - value) / 100) * usableHeight
    }));

    const linePath = points
      .map((point, index) => {
        return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
      })
      .join(" ");

    const areaPath =
      linePath +
      ` L ${width} ${height} L 0 ${height} Z`;

    chartLine.setAttribute("d", linePath);
    chartArea.setAttribute("d", areaPath);

    chartPoints.replaceChildren();

    points.forEach((point, index) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );

      circle.setAttribute("cx", point.x);
      circle.setAttribute("cy", point.y);
      circle.setAttribute("r", index === points.length - 1 ? 5 : 3);
      circle.setAttribute("class", "chart-point");
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "img");
      circle.setAttribute(
        "aria-label",
        `${labels[index]}: ${values[index]} illustrative activity points`
      );

      circle.addEventListener("click", () => {
        showToast(`${labels[index]}: activity score ${values[index]}`);
      });

      circle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showToast(`${labels[index]}: activity score ${values[index]}`);
        }
      });

      chartPoints.appendChild(circle);
    });

    chartLabels.replaceChildren();

    labels.forEach((label) => {
      const span = document.createElement("span");
      span.textContent = label;
      chartLabels.appendChild(span);
    });
  }

  renderChart(7);

  chartRange.addEventListener("change", () => {
    renderChart(chartRange.value);
  });

  // ADD RECENT ACTIVITY
  function addActivity(title, description, icon = "✧", color = "cyan") {
    const item = document.createElement("div");
    item.className = "activity-item";

    const iconElement = document.createElement("div");
    iconElement.className = `activity-icon ${color}`;
    iconElement.textContent = icon;

    const detail = document.createElement("div");
    detail.className = "activity-detail";

    const heading = document.createElement("strong");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = description;

    detail.append(heading, paragraph);

    const time = document.createElement("time");
    time.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    item.append(iconElement, detail, time);
    $("#activityList").prepend(item);
  }

  $("#clearActivity").addEventListener("click", () => {
    $("#activityList").replaceChildren();
    showToast("Activity history cleared.");
  });

  // AI ASSISTANT DEMO
  function startAssistant() {
    interactionCount++;
    $("#interactionCount").textContent = interactionCount;

    const content = document.createElement("div");

    const input = document.createElement("textarea");
    input.className = "modal-field";
    input.placeholder = "Type a message to TOBI...";
    input.rows = 3;
    input.setAttribute("aria-label", "Message to TOBI");

    const response = document.createElement("p");
    response.style.cssText =
      "margin-top:14px;color:var(--cyan);font-size:12px;line-height:1.7";

    content.append(input, response);

    openModal({
      title: "Talk to TOBI",
      description: "Try a simple command in this interactive demo.",
      symbol: "✧",
      content,
      actionLabel: "Send message",
      onAction: () => {
        const message = input.value.trim();

        if (!message) {
          input.focus();
          showToast("Please type a message first.");
          return false;
        }

        const lower = message.toLowerCase();
        let answer;

        if (/\b(hello|hi|hey)\b/.test(lower)) {
          answer = "Hello! I'm TOBI, your personal AI assistant.";
        } else if (lower.includes("time")) {
          answer = `The current time is ${new Date().toLocaleTimeString()}.`;
        } else if (lower.includes("date")) {
          answer = `Today's date is ${new Date().toLocaleDateString()}.`;
        } else if (lower.includes("dashboard")) {
          answer = "Your dashboard is ready to explore. Check the activity chart and quick tools.";
        } else if (lower.includes("help")) {
          answer = "Try asking me for the time, today's date, or a quick dashboard tour.";
        } else {
          answer = "This is a frontend demo. Connect a secure AI backend to receive real AI-generated answers.";
        }

        response.textContent = answer;
        input.value = "";
        input.placeholder = "You can send another message...";
        interactionCount++;
        $("#interactionCount").textContent = interactionCount;

        addActivity("Message sent to TOBI", message, "✧", "cyan");
        showToast("Demo response generated.");
        return false;
      }
    });

    window.setTimeout(() => input.focus(), 50);
  }

  $("#startAssistant").addEventListener("click", startAssistant);

  // QUICK TOOLS
  $$(".tool-card").forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.dataset.tool;

      if (tool === "chat") {
        startAssistant();
      }

      if (tool === "voice") {
        const content = document.createElement("div");
        const status = document.createElement("p");
        status.style.cssText =
          "margin-top:14px;color:var(--muted);line-height:1.8";

        const voiceButton = document.createElement("button");
        voiceButton.className = "primary-button";
        voiceButton.textContent = "Start voice recognition";

        content.append(status, voiceButton);

        const SpeechRecognition =
          window.SpeechRecognition ||
          window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
          status.textContent =
            "Speech recognition is not supported by this browser. Try a supported browser or use the AI Chat demo.";
          voiceButton.disabled = true;
        } else {
          status.textContent =
            "Allow microphone access when your browser asks. Recognition availability may depend on your browser and connection.";

          voiceButton.addEventListener("click", () => {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-IN";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            voiceButton.disabled = true;
            voiceButton.textContent = "Listening...";
            status.textContent = "Speak now...";

            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              status.textContent = `You said: "${transcript}"`;
              voiceButton.textContent = "Start again";
              voiceButton.disabled = false;

              addActivity(
                "Voice command captured",
                transcript,
                "♬",
                "violet"
              );

              showToast("Voice input captured.");
            };

            recognition.onerror = (event) => {
              status.textContent =
                `Voice recognition error: ${event.error}. Check microphone permissions and try again.`;
              voiceButton.disabled = false;
              voiceButton.textContent = "Try again";
            };

            recognition.onend = () => {
              voiceButton.disabled = false;

              if (voiceButton.textContent === "Listening...") {
                voiceButton.textContent = "Start again";
              }
            };

            try {
              recognition.start();
            } catch {
              status.textContent =
                "Could not start recognition. Close and reopen the voice tool.";
              voiceButton.disabled = false;
              voiceButton.textContent = "Try again";
            }
          });
        }

        openModal({
          title: "Voice Assistant",
          description: "Try speaking to your browser.",
          symbol: "♬",
          content,
          actionLabel: "Close"
        });
      }

      if (tool === "tasks") {
        const content = document.createElement("div");

        const input = document.createElement("input");
        input.className = "modal-field";
        input.placeholder = "Enter a task...";
        input.setAttribute("aria-label", "New task");

        const list = document.createElement("div");
        list.style.cssText =
          "display:grid;gap:10px;margin-top:14px";

        const addButton = document.createElement("button");
        addButton.className = "primary-button";
        addButton.textContent = "Add task";

        addButton.addEventListener("click", () => {
          const task = input.value.trim();

          if (!task) {
            input.focus();
            showToast("Enter a task first.");
            return;
          }

          const label = document.createElement("label");
          label.style.cssText =
            "display:flex;gap:10px;align-items:center;padding:10px;background:var(--bg);border-radius:9px;line-height:1.5";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";

          const taskText = document.createElement("span");
          taskText.textContent = task;

          checkbox.addEventListener("change", () => {
            taskText.style.textDecoration = checkbox.checked
              ? "line-through"
              : "none";

            if (checkbox.checked) {
              taskCount++;
              $("#taskCount").textContent = taskCount;

              addActivity("Task completed", task, "✓", "green");
            }
          });

          label.append(checkbox, taskText);
          list.appendChild(label);
          input.value = "";
          input.focus();
        });

        content.append(input, addButton, list);

        openModal({
          title: "My Tasks",
          description: "Add and check off tasks. These are temporary demo tasks.",
          symbol: "☑",
          content,
          actionLabel: "Close"
        });
      }

      if (tool === "notes") {
        const content = document.createElement("div");

        const textarea = document.createElement("textarea");
        textarea.className = "modal-field";
        textarea.rows = 5;
        textarea.maxLength = 5000;
        textarea.placeholder = "Write your note here...";
        textarea.value = savedNote;
        textarea.setAttribute("aria-label", "Quick note");

        const noteHint = document.createElement("p");
        noteHint.style.cssText =
          "margin-top:8px;color:var(--muted);font-size:10px";
        noteHint.textContent =
          "Notes remain available while this page is open. They are not saved to a database.";

        content.append(textarea, noteHint);

        openModal({
          title: "Quick Notes",
          description: "Capture an idea before you forget it.",
          symbol: "▤",
          content,
          actionLabel: "Save note",
          onAction: () => {
            savedNote = textarea.value;

            addActivity(
              "Quick note saved",
              savedNote.slice(0, 80) || "Empty note",
              "▤",
              "green"
            );

            showToast("Note saved for this page session.");
          }
        });
      }
    });
  });

  // THEME SWITCHER
  $("#themeButton").addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const isLight = document.body.classList.contains("light-theme");

    $("#themeButton").innerHTML = isLight
      ? "<span>◑</span> Switch to Dark"
      : "<span>◐</span> Toggle Theme";

    showToast(isLight ? "Light theme enabled." : "Dark theme enabled.");
  });

  // HELP CENTER
  $("#helpButton").addEventListener("click", () => {
    openModal({
      title: "TOBI Help Center",
      description: "Here is a quick guide to your dashboard.",
      symbol: "ⓘ",
      content:
        "AI Chat: try a sample conversation. Voice Assistant: test browser speech recognition. My Tasks: add checklist items. Quick Notes: write a temporary note. The statistics and system score are illustrative demo values.",
      actionLabel: "Got it"
    });
  });

  // EXPLORE TOBI
  $("#exploreButton").addEventListener("click", () => {
    openModal({
      title: "Explore TOBI AI",
      description: "Your personal assistant workspace.",
      symbol: "✦",
      content:
        "This starter dashboard includes interactive tools and sample analytics. Add your own AI API and backend to turn the demo into a connected assistant.",
      actionLabel: "Let's go",
      onAction: () => {
        startAssistant();
        return false;
      }
    });
  });

  // NOTIFICATIONS
  $("#notificationButton").addEventListener("click", () => {
    openModal({
      title: "Notifications",
      description: "You're all caught up.",
      symbol: "♧",
      content:
        "There are no new notifications in this demo. Connect a backend to display real-time alerts.",
      actionLabel: "Close"
    });
  });

  // ACTIVE NAVIGATION WHEN SCROLLING
  const sections = $$(".main-content section[id]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          )[0];

        if (!visible) return;

        const currentId = visible.target.id;

        $$(".nav-link[href]").forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${currentId}`
          );
        });
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.2, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // INITIAL DASHBOARD STATE
  addActivity(
    "TOBI dashboard initialized",
    "All dashboard components loaded successfully.",
    "✓",
    "green"
  );
});

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const mobileMenu = $("#mobileMenu");
  const navLinks = $("#navLinks");
  const backdrop = $("#modalBackdrop");
  const modalTitle = $("#modalTitle");
  const modalDescription = $("#modalDescription");
  const modalSymbol = $("#modalSymbol");
  const modalContent = $("#modalContent");
  const modalAction = $("#modalAction");

  let currentAction = null;

  // FOOTER YEAR
  $("#year").textContent = new Date().getFullYear();

  // MOBILE NAVIGATION
  mobileMenu.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");

    mobileMenu.setAttribute("aria-expanded", String(open));
    mobileMenu.textContent = open ? "×" : "☰";
  });

  $$("#navLinks a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      mobileMenu.setAttribute("aria-expanded", "false");
      mobileMenu.textContent = "☰";

      $$("#navLinks a").forEach((item) => {
        item.classList.remove("nav-active");
      });

      link.classList.add("nav-active");
    });
  });

  // MODAL HELPERS
  function openModal({
    title,
    description,
    symbol = "✧",
    message = "",
    actionLabel = "Close",
    onAction = null
  }) {
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalSymbol.textContent = symbol;
    modalContent.replaceChildren();

    if (message) {
      const paragraph = document.createElement("p");
      paragraph.className = "modal-demo-text";
      paragraph.textContent = message;
      modalContent.appendChild(paragraph);
    }

    modalAction.textContent = actionLabel;
    currentAction = onAction;
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    modalAction.focus();
  }

  function closeModal() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
    currentAction = null;
  }

  $("#modalClose").addEventListener("click", closeModal);

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.hidden) {
      closeModal();
    }
  });

  modalAction.addEventListener("click", () => {
    const action = currentAction;

    if (action) {
      const result = action();

      if (result === false) return;
    }

    closeModal();
  });

  // FEATURE INFORMATION
  const featureInfo = {
    chat: {
      title: "Intelligent AI Chat",
      symbol: "✧",
      description: "A conversational workspace for asking questions and exploring ideas.",
      message: "The current website demonstrates the interface only. Connect an AI service through a secure backend to generate real answers."
    },
    voice: {
      title: "Voice Interaction",
      symbol: "♬",
      description: "Use supported browser speech recognition to interact with TOBI.",
      message: "Voice input depends on browser support, microphone permissions, and sometimes an internet connection. This feature card is a preview, not a continuously listening assistant."
    },
    dashboard: {
      title: "Smart Dashboard",
      symbol: "▥",
      description: "Bring productivity tools and activity summaries together.",
      message: "You can connect this interface to real application data, analytics, and user-specific settings through your own backend."
    },
    tasks: {
      title: "Task Management",
      symbol: "☑",
      description: "Organize priorities and keep track of your daily checklist.",
      message: "A full task manager can include deadlines, reminders, completion status, and persistent storage."
    },
    notes: {
      title: "Quick Notes & Ideas",
      symbol: "▤",
      description: "Capture ideas and reminders in your workspace.",
      message: "For a production app, add authentication and database storage so users can safely access their notes across sessions."
    }
  };

  $$(".learn-more").forEach((button) => {
    button.addEventListener("click", () => {
      const info = featureInfo[button.dataset.feature];

      if (!info) return;

      openModal({
        title: info.title,
        description: info.description,
        symbol: info.symbol,
        message: info.message,
        actionLabel: "Got it"
      });
    });
  });

  // INTERACTIVE HERO DEMO
  $("#demoButton").addEventListener("click", () => {
    openModal({
      title: "Welcome to TOBI AI",
      description: "Your interactive feature preview is ready.",
      symbol: "✦",
      message: "Explore AI Chat, Voice Interaction, Smart Dashboard, Task Management, and Quick Notes. These cards demonstrate the interface; real AI responses require a connected AI service.",
      actionLabel: "Explore features",
      onAction: () => {
        $("#features").scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // CAPABILITY CONSOLE
  const consoleReply = $("#consoleReply");

  $$("[data-capability]").forEach((button) => {
    button.addEventListener("click", () => {
      const capability = button.dataset.capability;
      const reply = button.dataset.reply;

      consoleReply.replaceChildren();

      const icon = document.createElement("span");
      icon.textContent = "✦";

      const text = document.createElement("span");
      text.textContent = ` ${reply}`;

      consoleReply.append(icon, text);

      consoleReply.setAttribute(
        "aria-label",
        `${capability}: ${reply}`
      );
    });
  });

  // CAPABILITY BUTTON
  $("#capabilityButton").addEventListener("click", () => {
    $("#capabilities").scrollIntoView({ behavior: "smooth" });

    window.setTimeout(() => {
      const firstOption = $("[data-capability]");
      if (firstOption) firstOption.focus();
    }, 500);
  });

  // GET STARTED
  $("#getStartedButton").addEventListener("click", () => {
    openModal({
      title: "Let's get started",
      description: "Choose the next step for your TOBI AI project.",
      symbol: "✦",
      message: "Start by connecting an AI backend, setting up user authentication if needed, and integrating real task or note storage. This demo does not create an account or send your information anywhere.",
      actionLabel: "Explore features",
      onAction: () => {
        $("#features").scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // SCROLL REVEAL ANIMATIONS
  const revealElements = $$("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -25px 0px"
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("revealed");
    });
  }

  // HIGHLIGHT THE NAVIGATION SECTION
  const navTargets = [
    { id: "home", link: 'a[href="#home"]' },
    { id: "features", link: 'a[href="#features"]' },
    { id: "capabilities", link: 'a[href="#capabilities"]' },
    { id: "security", link: 'a[href="#security"]' }
  ];

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          );

        if (!visibleSections.length) return;

        const id = visibleSections[0].target.id;

        navTargets.forEach(({ id: targetId, link }) => {
          const navLink = $(link);

          if (navLink) {
            navLink.classList.toggle(
              "nav-active",
              id === targetId
            );
          }
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.15, 0.4]
      }
    );

    navTargets.forEach(({ id }) => {
      const section = document.getElementById(id);

      if (section) sectionObserver.observe(section);
    });
  }

  console.log("TOBI AI Features & Capabilities loaded successfully.");
});

document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    // Close menu after selecting a navigation link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      });
    });

    // Close menu with Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      }
    });
  }

  // Automatically update the copyright year
  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Reveal elements as they enter the screen
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // CTA demo notification
  const launchButton = document.getElementById("launchButton");
  const toast = document.getElementById("toast");
  const closeToast = document.getElementById("closeToast");

  let toastTimer;

  function showToast() {
    if (!toast) return;

    toast.classList.add("show");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 6000);
  }

  function hideToast() {
    if (toast) {
      toast.classList.remove("show");
    }

    window.clearTimeout(toastTimer);
  }

  if (launchButton) {
    launchButton.addEventListener("click", showToast);
  }

  if (closeToast) {
    closeToast.addEventListener("click", hideToast);
  }
});
