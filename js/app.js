async function setup() {
    const patchExportURL = "https://treezfolio-philtreezs-projects.vercel.app/export/patch.export.json";

    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();

    document.body.addEventListener("click", () => {
        if (context.state !== "running") {
            context.resume().then(() => console.log("AudioContext resumed!"));
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
        console.error("Fehler beim Laden des RNBO-Patchers:", err);
        return;
    }

    let device;
    try {
        device = await RNBO.createDevice({ context, patcher });
    } catch (err) {
        console.error("Fehler beim Erstellen des RNBO-Geräts:", err);
        return;
    }

    device.node.connect(outputNode);
    attachOutports(device);
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
