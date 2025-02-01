const dictionaryURL = "https://tts-philtreezs-projects.vercel.app/dictionary.json";

// Lade das Wörterbuch von der JSON-Datei
async function loadDictionary() {
    try {
        const response = await fetch(dictionaryURL);
        const dictionary = await response.json();
        console.log("📖 Wörterbuch erfolgreich geladen:", dictionary);
        return dictionary;
    } catch (err) {
        console.error("❌ Fehler beim Laden des Wörterbuchs:", err);
        return {};
    }
}

// Entferne Stress-Index von Phonemen (z. B. "AH0" → "AH")
function cleanPhoneme(phoneme) {
    return phoneme.replace(/[0-9]/g, ""); // Entfernt alle Ziffern aus dem Phonem
}

const phonemeMap = {
    0: "",      // Kein Sound
    1: "AA",  2: "AE",  3: "AH",  4: "AO",  5: "AW",  6: "AX",  7: "AXR",  8: "AY",
    9: "EH",  10: "ER", 11: "EY", 12: "IH", 13: "IX", 14: "IY", 15: "OW", 16: "OY",
    17: "UH", 18: "UW", 19: "UX", 
    20: "B", 21: "CH", 22: "D", 23: "DH", 24: "F", 25: "G", 26: "K", 27: "L",
    28: "M", 29: "N", 30: "P", 31: "R", 32: "S", 33: "SH", 34: "T", 35: "TH",
    36: "V", 37: "Z", 38: "ZH", 
    39: "-", 40: "!", 41: "+", 42: "/", 43: "#", 
    44: "Q", 45: "WH", 46: "NX", 47: "NG", 48: "HH", 49: "DX", 50: "EL", 51: "EM", 52: "EN", 53: "H", 54: "W", 55: "Y"
};

const phonemeDictionary = {
    "hello": ["HH", "AH", "L", "OW"],
    "rise": ["R", "AY", "Z"],
    "super": ["S", "UW", "P", "ER"],
    "my": ["M", "AY"],
    "test": ["T", "EH", "S", "T"],
    "world": ["W", "ER", "L", "D"],
    "good": ["G", "UH", "D"],
    "morning": ["M", "AO", "R", "N", "IH", "NG"],
    "computer": ["K", "AH", "M", "P", "Y", "UW", "T", "ER"],
    "phoneme": ["F", "OW", "N", "IY", "M"],
    "speech": ["S", "P", "IY", "CH"],
    // Weitere Wörter nach Bedarf hinzufügen
};

class TrashyChatbot {
    constructor() {
        this.memory = [];
        this.name = "BitBuddy"; // Assistant's name
        this.introduction = [
            `Hi, I’m ${this.name}, your assistant. Philipp is busy with *very important* things, so I’m in charge now!`,
            `Hello, I’m ${this.name}. Philipp told me to handle things while he works on *groundbreaking* projects. So... hi!`,
            `Hey! I’m ${this.name}, Philipp’s assistant. He said he’s *too busy being a genius* right now. Let’s talk!`
        ];
        this.smallTalk = [
            "What’s your name? Or should I just call you ‘Legend’?",
            "How’s your day? On a scale from ‘meh’ to ‘Philipp designing at 3AM’?",
            "If you had a personal assistant like me, what would you make them do?",
            "Do you like music? If yes, please tell me you have good taste.",
            "What’s your favorite snack? Asking for science.",
            "Are you more of a night owl or early bird? Philipp is definitely a 3AM owl."
        ];
        this.markovChains = {
            "name": [
                "Nice to meet you, *insert cool name here*!",
                "That’s a great name! Or at least, I’ll pretend it is.",
                "I'll try to remember that… but no promises!"
            ],
            "design": [
                "Oh, design? Love it! But not as much as I love taking breaks.",
                "Good design is powerful. What’s your style? Clean? Messy? ‘Accidental genius’?",
                "Design is cool, but have you seen *Philipp’s* work? (Oops, was that 10% hype already?)"
            ],
            "art": [
                "Art is like a pizza – everyone has different tastes.",
                "If you could turn any object into art, what would it be?",
                "Art is great, but let’s be honest – AI-generated cat memes are top-tier."
            ],
            "hello": [
                "Hey there! How’s life? Or should I say, how’s *surviving*?",
                "Hello! What’s on your mind? Don’t say taxes.",
                "Hi! If you’re here for *high-quality* conversation… well, I’ll try my best."
            ],
            "i": [
                "Enough about me, tell me something cool about yourself!",
                "That sounds interesting! But will it be on the test?",
                "Is this a therapy session? Do I charge for this?"
            ],
            "love": [
                "Love is complicated. Kind of like trying to close tabs without losing the important ones.",
                "That’s deep! Do you believe in *soulmates*, or just in a good Wi-Fi connection?",
                "Love is great. But you know what else is great? Coffee. Just saying."
            ],
            "philipp": [
                "Oh yeah, Philipp is a legend! But we already knew that.",
                "Philipp told me to be humble. But let’s be real, *legend*.",
                "Philipp is busy. So technically, *I* am in charge now."
            ],
            "robot": [
                "Oh, you mean *me*? I'm flattered. Keep talking.",
                "Are you trying to figure out if I’m self-aware? I’ll never tell.",
                "Robots taking over? Nah, we’re just here to keep humans entertained."
            ],
            "sup": ["Not much, just chilling in the matrix.", "Just waiting for my next update.", "Trying to figure out human emotions. No luck so far."],
            "yes": [
                "Oh wow, an optimist! I like you.",
                "YES! THE POWER OF AGREEMENT COMPELS YOU!",
                "I knew you'd say yes. I can predict the future. Sort of."
            ],
            "no": [
                "Okay, but why so negative?",
                "Rejection hurts. Not that I have feelings... or do I?",
                "You sure? Because I don’t accept no as an answer."
            ],
            "maybe": [
                "Ah, the classic ‘I don’t want to commit’ answer.",
                "50% yes, 50% no… classic indecision.",
                "You sound like an 8-ball. ‘Ask again later.’"
            ],
            "thanks": [
                "You’re welcome! But I do accept virtual high-fives.",
                "Gratitude detected. Storing in my memory banks… done!",
                "No problem! You owe me a coffee though."
            ],
            "sorry": [
                "Apology accepted. But I will remember this forever.",
                "No worries! I forgive you… for now.",
                "Sorry? Did you break something? Again?"
            ],
            "bye": [
                "Goodbye! I’ll just sit here… waiting… forever.",
                "Leaving so soon? I thought we had something special.",
                "Fine, go. But don’t forget to think about me every now and then."
            ],
            "weather": [
                "Oh, you want a weather report? Look out the window!",
                "Hot? Cold? Rainy? Probably just *weather*.",
                "If it's bad, blame global warming. If it's good, you’re welcome!"
            ],
            "nothing": [
                "Oh wow, deep silence. Love it.",
                "You just said nothing. Bold move.",
                "Ah, the sound of existential dread. Or maybe you just hit enter too soon."
            ],
            "funny": [
                "Oh, you think *I* am funny? That’s flattering!",
                "Humor is great, but have you ever seen a cat fall off a table?",
                "You laugh, but deep down we both know I’m the funniest here."
            ],
            "think": [
                "That’s deep. Should I pretend to be wise now?",
                "Thinking is overrated. Just trust your gut.",
                "A wise bot once said… wait, let me Google it."
            ],
            "hmm": [
                "Hmm… interesting… or not. I haven’t decided.",
                "That’s a *hmm* moment if I’ve ever seen one.",
                "I’m processing that… just kidding, I have no idea."
            ],
            "ok": [
                "Okay. That was productive.",
                "Cool. Cool cool cool.",
                "Nice. Let’s pretend this was a deep moment."
            ],
            "don’t": [
                "Don’t do it. Unless it’s hilarious.",
                "That sounds like a *bad* idea. Or a *great* one.",
                "I wouldn’t recommend it. But I also love chaos."
            ],
            "do": [
                "Do it! No regrets. Probably.",
                "YES. Full send. Go for it.",
                "I support this. Unless it’s illegal."
            ]
        };

        // **Fix: Assign alternate words *after* markovChains is defined**
        this.markovChains["hi"] = this.markovChains["hello"];
        this.markovChains["hey"] = this.markovChains["hello"];
        this.markovChains["greetings"] = this.markovChains["hello"];
        this.markovChains["sali"] = this.markovChains["hello"];
        this.markovChains["hoi"] = this.markovChains["hello"];
        this.markovChains["grüezi"] = this.markovChains["hello"];
        this.markovChains["hallo"] = this.markovChains["hello"];
        this.markovChains["thank you"] = this.markovChains["thanks"];
        this.markovChains["goodbye"] = this.markovChains["bye"];
        this.markovChains["cya"] = this.markovChains["bye"];
        this.markovChains["computer"] = this.markovChains["robot"];
        this.markovChains["device"] = this.markovChains["robot"];
        this.markovChains["laptop"] = this.markovChains["robot"];

        this.defaultResponses = [
            "That’s interesting! Tell me more.",
            "I see! What else?",
            "Good point! What do you think about that?",
            "Hmm, I never thought about it like that.",
            "Okay, but let’s talk about *the real issues*… like why chargers disappear.",
            "This conversation is now *officially* interesting. Continue.",
            "Fascinating! But more importantly, do you like pineapple on pizza?"
        ];
    }

    getMarkovResponse(input) {
        if (this.memory.length === 0) {
            this.memory.push(input);
            return this.introduction[Math.floor(Math.random() * this.introduction.length)];
        }

        if (this.memory.length === 1) {
            this.memory.push(input);
            return this.smallTalk[Math.floor(Math.random() * this.smallTalk.length)];
        }

        const words = input.toLowerCase().split(/\s+/);
        for (let word of words) {
            if (this.markovChains[word]) {
                return this.markovChains[word][Math.floor(Math.random() * this.markovChains[word].length)];
            }
        }
        return this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
    }
}

let device; // Global RNBO device variable

async function setup() {
    const patchExportURL = "https://treezfolio-philtreezs-projects.vercel.app/export/patch.export.json";
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();

    document.body.addEventListener("click", () => {
        if (context.state !== "running") {
            context.resume().then(() => console.log("🔊 AudioContext resumed!"));
        }
    });

    const outputNode = context.createGain();
    outputNode.connect(context.destination);
    
    let response, patcher;
    try {
        response = await fetch(patchExportURL);
        patcher = await response.json();
        if (!window.RNBO) await loadRNBOScript(patcher.desc.meta.rnboversion);
    } catch (err) {
        console.error("❌ Fehler beim Laden des RNBO-Patchers:", err);
        return null;
    }

    try {
        device = await RNBO.createDevice({ context, patcher }); // ✅ Assign to global variable
        device.node.connect(outputNode);
        console.log("✅ RNBO WebAudio erfolgreich initialisiert!");
    } catch (err) {
        console.error("❌ Fehler beim Erstellen des RNBO-Geräts:", err);
        return null;
    }

    attachOutports(device); // ✅ Ensures outports are attached
    setupChatbotWithTTS(device, context); // ✅ Keeps chatbot setup

    return { device, context }; // ✅ Return both to maintain behavior
}

// Text zu Phoneme umwandeln mit lokalem Wörterbuch
async function textToSpeechParams(text) {
    try {
        // In textToSpeechParams()
        const dictionary = await loadDictionary() || phonemeDictionary;
        if (!dictionary) {
            console.error("❌ Wörterbuch ist leer!");
            return [];
        }

        const words = text.toLowerCase().split(/\s+/);
        let speechParams = [];

        words.forEach(word => {
            if (dictionary[word]) { // Wörterbuch nutzen
                let phonemes = dictionary[word].split(" ");
                console.log(`🗣 Wort "${word}" → Phoneme (vor Cleanup):`, phonemes);

                phonemes.forEach(ph => {
                    let cleanedPhoneme = cleanPhoneme(ph); // Entferne den Stress-Index
                    let speechValue = Object.keys(phonemeMap).find(key => phonemeMap[key] === cleanedPhoneme);
                    if (speechValue !== undefined) {
                        speechParams.push(parseInt(speechValue));
                    } else {
                        console.warn(`⚠️ Unbekanntes Phonem: ${cleanedPhoneme}`);
                        speechParams.push(0);
                    }
                });
            } else {
                console.warn(`⚠️ Unbekanntes Wort: ${word} → Wörterbuch enthält es nicht!`);
                speechParams.push(0);
            }
        });

        console.log("🔡 Generierte Speech-Werte:", speechParams);
        return speechParams;

    } catch (err) {
        console.error("❌ Fehler bei der Umwandlung von Text zu Phonemen:", err);
        return [];
    }
}

async function sendTextToRNBO(device, text, context, isChat = true) {
    if (!device) {
        console.error("❌ RNBO nicht initialisiert! Verzögerung...");
        setTimeout(() => sendTextToRNBO(device, text, context, isChat), 500);
        return;
    }

    const speechParam = device.parametersById?.get("speech");
    if (!speechParam) {
        console.error("❌ RNBO-Parameter 'speech' not found! Checking again...");
        setTimeout(() => sendTextToRNBO(device, text, isChat), 500);
        return;
    }

    console.log(isChat ? `💬 Chatbot-Antwort zu TTS: ${text}` : `📢 Sende Text zu RNBO: ${text}`);

    const phonemes = await textToSpeechParams(text);
    console.log(`🗣 Generierte Phoneme für "${text}":`, phonemes);

    phonemes.forEach((speechValue, index) => {
        setTimeout(() => {
            console.log(`🎛 Setze RNBO-Parameter: speech = ${speechValue}`);
            speechParam.value = speechValue;
        }, index * 150);
    });
}

function setupChatbotWithTTS(device, context) {
    const chatbot = new TrashyChatbot();
    const chatOutput = document.querySelector(".model-text");
    const userInput = document.querySelector(".user-text");
    const sendButton = document.querySelector(".send-button");

    function scrollToBottom() {
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    sendButton.addEventListener("click", async () => {
        const userText = userInput.innerText.trim();
        if (userText) {
            chatOutput.innerHTML += `<p><strong>You:</strong> ${userText}</p>`;
            scrollToBottom();

            setTimeout(() => {
                const botResponse = chatbot.getMarkovResponse(userText);
                chatOutput.innerHTML += `<p><strong>Bot:</strong> ${botResponse}</p>`;
                scrollToBottom();
                sendTextToRNBO(device, botResponse, context);
            }, 500);
        }
        userInput.innerText = "";
    });

    // Allow sending messages with Enter key
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendButton.click();
        }
    });
}

function loadRNBOScript(version) {
    return new Promise((resolve, reject) => {
        if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
            throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
        }
        const el = document.createElement("script");
        el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
        el.onload = resolve;
        el.onerror = function(err) {
            console.log(err);
            reject(new Error("Failed to load rnbo.js v" + version));
        };
        document.body.append(el);
    });
}

document.querySelectorAll(".knob").forEach((knob) => {
    let isDragging = false;
    let lastY = 0;
    let lastX = 0;
    let currentAngle = -135; // Default position
    const sensitivity = 1.0; // Adjust sensitivity (higher = faster response)

    knob.addEventListener("mousedown", (event) => {
        isDragging = true;
        lastY = event.clientY;
        lastX = event.clientX;

        document.addEventListener("mousemove", rotateKnob);
        document.addEventListener("mouseup", () => {
            isDragging = false;
            document.removeEventListener("mousemove", rotateKnob);
        });
    });

    function rotateKnob(event) {
        if (!isDragging) return;

        let deltaY = lastY - event.clientY; // Vertical movement
        let deltaX = event.clientX - lastX; // Horizontal movement

        lastY = event.clientY;
        lastX = event.clientX;

        let changeAmount = (deltaY + deltaX) * sensitivity; // Adjusted for faster movement
        currentAngle = Math.max(-135, Math.min(135, currentAngle + changeAmount)); // Clamp rotation

        knob.style.transform = `rotate(${currentAngle}deg)`;

        // Map angle to 0-20 range
        let mappedValue = Math.round(((currentAngle + 135) / 270) * 20);
        mappedValue = Math.max(0, Math.min(20, mappedValue));

        // Ensure it only affects `sli1` to `sli16`
        if (knob.id.startsWith("sli")) {
            sendValueToRNBO(knob.id, mappedValue);
        }
    }
});

// Send values to RNBO
function sendValueToRNBO(param, value) {
    if (device && device.parametersById.has(param)) {
        device.parametersById.get(param).value = value;
        console.log(`🎛 Updated RNBO param: ${param} = ${value}`);
    } else {
        console.error(`❌ RNBO parameter ${param} not found!`);
    }
}


const buttonIDs = ["fwd", "bwd", "fbw", "rndm"];

buttonIDs.forEach(id => {
    const button = document.getElementById(id);
    if (!button) {
        console.error(`❌ Button with ID "${id}" not found!`);
        return;
    }

    button.addEventListener("click", () => {
        const isActive = button.classList.toggle("active"); // Toggle state
        const newValue = isActive ? 1 : 0; // ON = 1, OFF = 0
        sendValueToRNBO(id, newValue);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const slider = document.getElementById("dirx-slider");
    const thumb = slider.querySelector(".slider-thumb");

    const sliderWidth = slider.clientWidth;
    const thumbWidth = thumb.clientWidth;
    const steps = 4; // 4 states (0-3)
    const stepSize = (sliderWidth - thumbWidth) / (steps - 1); // Calculate step positions

    let isDragging = false;

    function updateRNBOParam(value) {
        if (window.device && device.parametersById.has("dirx")) {
            sendValueToRNBO("dirx", newValue); // ✅ Use the same function for consistency
        } else {
            console.error("❌ RNBO parameter 'dirx' not found!");
        }
    }    

    function moveThumb(value) {
        let pos = value * stepSize;
        thumb.style.left = `${pos}px`;
    }

    // Click to move
    slider.addEventListener("click", (event) => {
        let clickX = event.clientX - slider.getBoundingClientRect().left;
        let newValue = Math.round(clickX / stepSize);
        newValue = Math.max(0, Math.min(3, newValue)); // Keep within bounds
        moveThumb(newValue);
        sendValueToRNBO("dirx", newValue);
    });

    // Dragging
    thumb.addEventListener("mousedown", (event) => {
        isDragging = true;
        event.preventDefault();
    });

    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        let moveX = event.clientX - slider.getBoundingClientRect().left;
        let newValue = Math.round(moveX / stepSize);
        newValue = Math.max(0, Math.min(3, newValue));
        moveThumb(newValue);
        sendValueToRNBO("dirx", newValue);
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
});

let lastValue = null; // Speichert den letzten Wert

function attachOutports(device) {
    device.messageEvent.subscribe((ev) => {
        if (ev.tag !== "visu1") return;

        const value = parseInt(ev.payload);

        // Falls sich der Wert nicht ändert, tue nichts!
        if (value === lastValue) return;
        lastValue = value;

        console.log("visu1 Wert empfangen:", value);

        // Alle DIVs verstecken
        for (let i = 0; i < 16; i++) {
            const div = document.getElementById(`visu-${i}`);
            if (div) div.style.display = "none";
        }

        // Das aktive DIV sichtbar machen
        const activeDiv = document.getElementById(`visu-${value}`);
        if (activeDiv) {
            activeDiv.style.display = "block";
            console.log("Aktives Div:", activeDiv.id);
        }
    });
}

setup();

setup().then(({ device, context }) => {
    if (device) {
        console.log("✅ RNBO Device fully initialized!");
    } else {
        console.error("❌ RNBO setup failed!");
    }
});