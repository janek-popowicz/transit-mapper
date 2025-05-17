import { setPlacingNode, setTempNode , setDrawingSegment, setTempSegment} from './script.js';

export function showEditMenu(type, element, applyChanges, fetchMapData, mapData) {
    // Usuń stare menu jeśli istnieje
    document.querySelectorAll('.edit-menu').forEach(m => m.remove());

    const menu = document.createElement("div");
    menu.className = "edit-menu";

    // Generowanie zawartości menu w zależności od typu
    if (type === "node") {
        menu.innerHTML = `
            <h3>Edit Node</h3>
            <label>ID: <input type="text" id="node-id" value="${element.id || ''}" readonly></label><br>
            <label>Label: <input type="text" id="node-label" value="${element.label || ''}"></label><br>
            <label>Label Position: <input type="text" id="node-label-position" value="${element.label_position.join(', ')}"></label><br>
            <label>Label text rotation: <input type="number" id="node-label-text-degree" value="${element.label_text_degree || 90}"></label><br>
            <label>Type: <input type="text" id="node-type" value="${element.type || ''}"></label><br>
            <label>Size: <input type="number" id="node-size" value="${element.size || 0}"></label><br>
            <button id="edit-node-position">Edit Position</button>
            <button id="remove-node">Remove</button>
            <button id="save-node">Save</button>
        `;
    } else if (type === "segment") {
        menu.innerHTML = `
            <h3>Edit Segment</h3>
            <label>ID: <input type="text" id="segment-id" value="${element.id || ''}" readonly></label><br>
            <label>Start Node: <input type="text" id="segment-start-node" value="${element.start_node || ''}" readonly></label><br>
            <label>End Node: <input type="text" id="segment-end-node" value="${element.end_node || ''}"></label><br>
            <label>Lines: <input type="text" id="segment-lines" value="${element.lines.join(', ')}"></label><br>
            <label>Route: <textarea id="segment-route">${element.route.map(coord => coord.join(', ')).join('; ')}</textarea></label><br>
            <button id="change-edit-path">Change Edit Path</button>
            <button id="remove-segment">Remove</button>
            <button id="save-segment">Save</button>
        `;
    } else if (type === "icon") {
        menu.innerHTML = `
            <h3>Edit Icon</h3>
            <label>Label: <input type="text" id="icon-label" value="${element.label || ''}"></label><br>
            <label>Coordinates: <input type="text" id="icon-coordinates" value="${element.coordinates.join(', ')}"></label><br>
            <label>Icon Path: <input type="text" id="icon-path" value="${element.icon || ''}"></label><br>
            <label>Size: <input type="number" id="icon-size" value="${element.size || 0}"></label><br>
            <button id="remove-icon">Remove</button><br>
            <button id="save-icon">Save</button>
        `;
    } else if (type === "river") {
        menu.innerHTML = `
            <h3>Edit River</h3>
            <label>Label: <input type="text" id="river-label" value="${element.label || ''}"></label><br>
            <label>Route: <textarea id="river-route">${element.route.map(coord => coord.join(', ')).join('; ')}</textarea></label><br>
            <label>Width: <input type="number" id="river-width" value="${element.width || 0}"></label><br>
            <label>Color: <input type="color" id="river-color" value="${element.color || '#000000'}"></label><br>
            <button id="remove-river">Remove</button><br>
            <button id="save-river">Save</button>
        `;
    } else if (type === "line") {
        menu.innerHTML = `
            <h3>Edit Line</h3>
            <label>ID: <input type="text" id="line-id" value="${element.id || ''}" readonly></label><br>
            <label>Label: <input type="text" id="line-label" value="${element.label || ''}"></label><br>
            <label>Color: <input type="color" id="line-color" value="${element.color || '#000000'}"></label><br>
            <label>Thickness: <input type="number" id="line-thickness" value="${element.thickness || 0}"></label><br>
            <button id="remove-line">Remove</button><br>
            <button id="save-line">Save</button>
        `;
    } else if (type === "map_settings") {
        menu.innerHTML = `
            <h3>Edit Map Settings</h3>
            <label>Labels Size: <input type="number" id="map-labels-size" value="${element.labels_size || 0}"></label><br>
            <label>Labels Color: <input type="color" id="map-labels-color" value="${element.labels_color || '#000000'}"></label><br>
            <label>Background Image: <input type="text" id="map-background-image" value="${element.background_image || ''}"></label><br>
            <button id="save-map-settings">Save</button>
        `;
    }

    document.body.appendChild(menu);

    // Zamknij menu po kliknięciu poza nim
    function handleOutsideClick(event) {
        if (!menu.contains(event.target)) {
            menu.remove();
            document.removeEventListener('mousedown', handleOutsideClick);
        }
    }
    setTimeout(() => { // timeout by nie łapało kliknięcia otwierającego
        document.addEventListener('mousedown', handleOutsideClick);
    }, 0);

    // Obsługa zapisu zmian
    menu.querySelector("#save-" + type).addEventListener("click", () => {
        if (type === "node") {
            element.label = menu.querySelector("#node-label").value;
            element.label_position = menu.querySelector("#node-label-position").value.split(',').map(Number);
            element.label_text_degree = parseInt(menu.querySelector("#node-label-text-degree").value, 10);
            element.type = menu.querySelector("#node-type").value;
            element.size = parseInt(menu.querySelector("#node-size").value, 10);

            // Zaktualizuj współrzędne węzła
            const nodeIndex = mapData.nodes.findIndex(node => node.id === element.id);
            if (nodeIndex !== -1) {
                mapData.nodes[nodeIndex] = element;

                // Zaktualizuj segmenty powiązane z tym węzłem
                updateSegmentsForNode(element);
            }
        } else if (type === "segment") {
            element.start_node = menu.querySelector("#segment-start-node").value;
            element.end_node = menu.querySelector("#segment-end-node").value;
            element.lines = menu.querySelector("#segment-lines").value.split(',').map(s => s.trim());
            element.route = menu.querySelector("#segment-route").value.split(';').map(coord => coord.split(',').map(Number));
        } else if (type === "icon") {
            element.label = menu.querySelector("#icon-label").value;
            element.coordinates = menu.querySelector("#icon-coordinates").value.split(',').map(Number);
            element.icon = menu.querySelector("#icon-path").value;
            element.size = parseInt(menu.querySelector("#icon-size").value, 10);
        } else if (type === "river") {
            element.label = menu.querySelector("#river-label").value;
            element.route = menu.querySelector("#river-route").value.split(';').map(coord => coord.split(',').map(Number));
            element.width = parseInt(menu.querySelector("#river-width").value, 10);
            element.color = menu.querySelector("#river-color").value;
        } else if (type === "line") {
            element.id = menu.querySelector("#line-id").value;
            element.label = menu.querySelector("#line-label").value;
            element.color = menu.querySelector("#line-color").value;
            element.thickness = parseInt(menu.querySelector("#line-thickness").value, 10);
        } else if (type === "map_settings") {
            element.labels_size = parseInt(menu.querySelector("#map-labels-size").value, 10);
            element.labels_color = menu.querySelector("#map-labels-color").value;
            element.background_image = menu.querySelector("#map-background-image").value;
        }

        applyChanges(type, element);
        menu.remove();
        fetchMapData();
    });

    menu.querySelector("#remove-" + type).addEventListener("click", () => {
        if (type === "node") {
            // Usuń węzeł i powiązane segmenty
            mapData.nodes = mapData.nodes.filter(node => node.id !== element.id);
            mapData.segments = mapData.segments.filter(segment => 
                segment.start_node !== element.id && segment.end_node !== element.id
            );
        } else if (type === "segment") {
            // Usuń segment
            mapData.segments = mapData.segments.filter(segment => segment.id !== element.id);
        } else if (type === "line") {
            // Usuń linię i jej odniesienia w segmentach
         //   console.log(mapData.lines)
            mapData.lines = mapData.lines.filter(line => line.id !== element.id);
            mapData.segments.forEach(segment => {
                segment.lines = segment.lines.filter(lineId => lineId !== element.id);
            });
        } else if (type === "icon") {
            // Usuń ikonę
            mapData.icons = mapData.icons.filter(icon => icon.id !== element.id);
        } else if (type === "river") {
            // Usuń rzekę
            mapData.rivers = mapData.rivers.filter(river => river.id !== element.id);
        }

        // Zaktualizuj mapę i zamknij menu
        fetchMapData();
        menu.remove();
    });

    menu.querySelector("#edit-node-position")?.addEventListener("click", () => {
        if (type === "node") {
            setPlacingNode(true);
            setTempNode({ ...element }); // Skopiuj dane węzła do `tempNode`
            // canvas.style.cursor = "crosshair"; // Zmień kursor na krzyżyk
            menu.remove(); // Zamknij menu edycji
            console.log(mapData)
        }
    });

    menu.querySelector("#change-edit-path")?.addEventListener("click", () => {
        if (type === "segment") {
            setDrawingSegment(true);
            setTempSegment({
                id: element.id,
                start_node: element.start_node,
                end_node: null,
                route: [element.route[0]], // Zaczynamy od istniejącego węzła początkowego
                lines: element.lines
            });
            // canvas.style.cursor = "crosshair"; // Zmień kursor na krzyżyk
            menu.remove(); // Zamknij menu edycji
            console.log(mapData)
        }
    });
}