export function generateLineList(mapData, applyChanges, fetchMapData, showEditMenu) {
    const lineList = document.getElementById("line-list");
    lineList.innerHTML = ""; // Wyczyść listę

    if (!mapData || !mapData.lines) {
        console.error("mapData or mapData.lines is undefined.");
        return;
    }

    // Generowanie listy linii
    mapData.lines.forEach(line => {
        const listItem = document.createElement("li");
        listItem.textContent = line.label || `Line ${line.id}`;
        listItem.addEventListener("click", () => {
            showEditMenu("line", line, applyChanges, fetchMapData, mapData);
        });
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