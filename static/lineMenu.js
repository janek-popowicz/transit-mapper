export function generateLineList(mapData, applyChanges, fetchMapData, showEditMenu) {
    const lineList = document.getElementById("line-list");
    lineList.innerHTML = ""; // Wyczyść listę


    if (!mapData || !mapData.lines) {
        console.error("mapData or mapData.lines is undefined.");
        return;
    }
    mapData.lines.forEach(line => {
        const listItem = document.createElement("li");
        listItem.textContent = line.label || `Line ${line.id}`;
        listItem.addEventListener("click", () => {
            showEditMenu("line", line, applyChanges, fetchMapData);
        });
        lineList.appendChild(listItem);
    });

    // Dodaj przycisk "Add New Line"
    const addNewLineButton = document.getElementById("add-new-line");
    addNewLineButton.addEventListener("click", () => {
        const newLine = {
            line_id: `L${Date.now() - 1747432671848}`, // Tymczasowe ID
            label: "New Line",
            color: "#000000",
            thickness: 5
        };
        mapData.lines.push(newLine);
        showEditMenu("line", newLine, applyChanges, fetchMapData);
        generateLineList(); // Odśwież listę
    });
}