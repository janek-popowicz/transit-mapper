import { mapData, setMapData, fetchMapData, recentIcon} from './script.js';

export async function uploadMap() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const newData = JSON.parse(e.target.result); // Wczytaj dane
                setMapData(newData); // Zaktualizuj mapData
                console.log("Map data loaded:", mapData);
                fetchMapData(); // Odśwież mapę
            } catch (error) {
                console.error("Error parsing map data:", error);
            }
        };
        reader.readAsText(file);
    });

    input.click(); // Otwórz okno wyboru pliku
}

export function downloadMap(mapData) {
    if (!mapData) {
        console.error("No map data to download.");
        return;
    }

    const dataStr = JSON.stringify(mapData, null, 2); // Sformatuj dane jako JSON
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transit-mapper-map.json`;
    a.click();

    URL.revokeObjectURL(url); // Zwolnij pamięć
}

export async function loadInitialMapData(fetchMapData) {
    try {
        const response = await fetch('/map.json'); // Wczytaj dane z endpointu
        const mapData = await response.json(); // Zapisz dane w globalnej zmiennej
        setMapData(mapData); // Ustaw mapData
        console.log("Initial map data loaded:", mapData);
        fetchMapData(); // Rysuj mapę
    } catch (error) {
        console.error("Error loading initial map data:", error);
    }
}

export async function uploadIcon() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".svg";

    input.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("icon", file);

        try {
            const response = await fetch("/upload-icon", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Error uploading icon:", error.error);
                alert(`Error: ${error.error}`);
                return;
            }

            const result = await response.json();
            console.log("Icon uploaded successfully:", result);
            alert(`Icon uploaded successfully! Path: ${result.path}`);
            recentIcon = result.path
        } catch (error) {
            console.error("Error uploading icon:", error);
            alert("An error occurred while uploading the icon.");
        }
    });

    input.click(); // Open the file dialog
}

