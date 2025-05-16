export function showEditMenu(type, element, applyChanges, fetchMapData) {
    // Usuń stare menu jeśli istnieje
    document.querySelectorAll('.edit-menu').forEach(m => m.remove());

    const menu = document.createElement("div");
    menu.className = "edit-menu";

    // Generowanie zawartości menu w zależności od typu
    if (type === "node") {
        menu.innerHTML = `
            <h3>Edit Node</h3>
            <label>Label: <input type="text" id="node-label" value="${element.label || ''}"></label><br>
            <label>Coordinates: <input type="text" id="node-coordinates" value="${element.coordinates.join(', ')}"></label><br>
            <label>Type: <input type="text" id="node-type" value="${element.type || ''}"></label><br>
            <label>Size: <input type="number" id="node-size" value="${element.size || 0}"></label><br>
            <button id="save-node">Save</button>
        `;
    } else if (type === "segment") {
        menu.innerHTML = `
            <h3>Edit Segment</h3>
            <label>ID: <input type="text" id="segment-id" value="${element.id || ''}" readonly></label><br>
            <label>Start Node: <input type="text" id="segment-start-node" value="${element.start_node || ''}"></label><br>
            <label>End Node: <input type="text" id="segment-end-node" value="${element.end_node || ''}"></label><br>
            <label>Lines: <input type="text" id="segment-lines" value="${element.lines.join(', ')}"></label><br>
            <label>Route: <textarea id="segment-route">${element.route.map(coord => coord.join(', ')).join('; ')}</textarea></label><br>
            <button id="save-segment">Save</button>
        `;
    } else if (type === "icon") {
        menu.innerHTML = `
            <h3>Edit Icon</h3>
            <label>Label: <input type="text" id="icon-label" value="${element.label || ''}"></label><br>
            <label>Coordinates: <input type="text" id="icon-coordinates" value="${element.coordinates.join(', ')}"></label><br>
            <label>Icon Path: <input type="text" id="icon-path" value="${element.icon || ''}"></label><br>
            <label>Size: <input type="number" id="icon-size" value="${element.size || 0}"></label><br>
            <button id="save-icon">Save</button>
        `;
    } else if (type === "river") {
        menu.innerHTML = `
            <h3>Edit River</h3>
            <label>Label: <input type="text" id="river-label" value="${element.label || ''}"></label><br>
            <label>Route: <textarea id="river-route">${element.route.map(coord => coord.join(', ')).join('; ')}</textarea></label><br>
            <label>Width: <input type="number" id="river-width" value="${element.width || 0}"></label><br>
            <label>Color: <input type="color" id="river-color" value="${element.color || '#000000'}"></label><br>
            <button id="save-river">Save</button>
        `;
    } else if (type === "line") {
        menu.innerHTML = `
            <h3>Edit Line</h3>
            <label>Label: <input type="text" id="line-label" value="${element.label || ''}"></label><br>
            <label>Color: <input type="color" id="line-color" value="${element.color || '#000000'}"></label><br>
            <label>Thickness: <input type="number" id="line-thickness" value="${element.thickness || 0}"></label><br>
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
    menu.querySelector("button").addEventListener("click", () => {
        if (type === "node") {
            element.label = menu.querySelector("#node-label").value;
            element.coordinates = menu.querySelector("#node-coordinates").value.split(',').map(Number);
            element.type = menu.querySelector("#node-type").value;
            element.size = parseInt(menu.querySelector("#node-size").value, 10);
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
}