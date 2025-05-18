import { selectedLines, setSelectedLines } from './script.js';

export function generateLineList(mapData, applyChanges, fetchMapData, showEditMenu) {
    const lineList = document.getElementById("line-list");
    lineList.innerHTML = ""; // Wyczyść listę

    if (!mapData || !mapData.lines) {
        console.error("mapData or mapData.lines is undefined.");
        return;
    }

    // Generowanie listy linii z checkboxami i możliwością edycji
    mapData.lines.forEach(line => {
        const listItem = document.createElement("li");
        listItem.style.display = "flex";
        listItem.style.alignItems = "center";
        listItem.style.justifyContent = "space-between";
        listItem.style.cursor = "pointer";

        // Checkbox do zaznaczania linii
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = selectedLines.includes(line.id); // Zaznacz, jeśli linia jest w `selectedLines`
        // Odznacz checkbox, jeśli linia nie jest w `selectedLines`
        checkbox.checked = selectedLines.includes(line.id);
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                if (!selectedLines.includes(line.id)) {
                    selectedLines.push(line.id); // Dodaj linię do selectedLines
                }
            } else {
                const index = selectedLines.indexOf(line.id);
                if (index !== -1) selectedLines.splice(index, 1); // Usuń linię z selectedLines
            }
            setSelectedLines([...selectedLines]); // Zaktualizuj globalną listę
            console.log("Selected lines:", selectedLines);
        });

        // Label z nazwą linii
        const label = document.createElement("span");
        label.textContent = line.label || `Line ${line.id}`;
        label.style.marginLeft = "10px";
        label.style.flexGrow = "1";

        // Kliknięcie w nazwę linii otwiera menu edycji
        label.addEventListener("click", () => {
            showEditMenu("line", line, applyChanges, fetchMapData, mapData);
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        lineList.appendChild(listItem);
    });

    // Obsługa przycisku "Add New Line"
    const addNewLineButton = document.getElementById("add-new-line");

    // Usuń istniejący nasłuchiwacz, jeśli istnieje
    const newButton = addNewLineButton.cloneNode(true);
    addNewLineButton.replaceWith(newButton);

    newButton.addEventListener("click", () => {
        if (!mapData.lines) {
            mapData.lines = []; // Inicjalizuj jako pustą tablicę, jeśli nie istnieje
        }

        const newLine = {
            id: `L${Date.now() - 1747432671848}`, // Tymczasowe ID
            label: `New Line ${Date.now() - 1747432671848}`,
            color: "#000000",
            thickness: 5
        };

        mapData.lines.push(newLine); // Dodaj nową linię do mapData
        showEditMenu("line", newLine, applyChanges, fetchMapData, mapData); // Otwórz menu edycji
    });
}