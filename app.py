from flask import Flask, render_template, request, jsonify
from backend.engine import Engine
app = Flask(__name__, static_folder="static", template_folder="templates")
engine = Engine()
@app.route("/")
def index():
    """
    Render the main page.
    """
    return render_template("index.html")

@app.route("/add_node", methods=["POST"])
def add_node():
    """
    Add a new node to the map.
    """
    data = request.json
    result = engine.add_node(
        data["node_id"],
        data["label"],
        tuple(data["coordinates"]),
        data["type"]
    )
    return jsonify(result)

@app.route("/add_segment", methods=["POST"])
def add_segment():
    """
    Add a new segment to the map.
    """
    data = request.json
    result = engine.add_segment(
        data["id"],  # Dodaj ID segmentu
        data["start_node_id"],
        data["end_node_id"],
        data["lines"],
        data["route"]
    )
    return jsonify(result)

@app.route("/add_line", methods=["POST"])
def add_line():
    """
    Add a new line to the map.
    """
    data = request.json
    result = engine.add_line(
        data["line_id"],
        data["label"],
        data["color"]
    )
    return jsonify(result)

@app.route("/add_river", methods=["POST"])
def add_river():
    """
    Add a new river to the map.
    """
    data = request.json
    result = engine.map_data.add_river(
        River(
            river_id=data["id"],
            label=data["label"],
            route=data["route"],
            width=data["width"],
            color=data["color"]
        )
    )
    return jsonify({"status": "success", "message": "River added."})

@app.route("/add_icon", methods=["POST"])
def add_icon():
    """
    Add a new icon to the map.
    """
    data = request.json
    result = engine.map_data.add_icon(
        Icon(
            icon_id=data["id"],
            label=data["label"],
            coordinates=tuple(data["coordinates"]),
            icon=data["icon"],
            size=data["size"]
        )
    )
    return jsonify({"status": "success", "message": "Icon added."})

@app.route("/edit_node", methods=["POST"])
def edit_node():
    """
    Edit an existing node.
    """
    data = request.json
    print("Received data for node:", data)  # Loguj dane w terminalu
    result = engine.edit_node(
        data["id"],
        label=data.get("label"),
        coordinates=tuple(data.get("coordinates", [])),
        node_type=data.get("type"),
        size=data.get("size"),
        label_position=data.get("label_position"),
        label_text_degree=data.get("label_text_degree")
    )
    return jsonify(result)

@app.route("/edit_icon", methods=["POST"])
def edit_icon():
    """
    Edit an existing icon.
    """
    data = request.json
    print("Received data:", data)  # Loguj dane w terminalu
    icon = engine.map_data.get_icon(data["id"])
    if not icon:
        return jsonify({"status": "error", "message": f"Icon {data['id']} does not exist."}), 404

    # Aktualizuj właściwości ikony
    if "label" in data:
        icon.label = data["label"]
    if "coordinates" in data:
        icon.coordinates = tuple(data["coordinates"])
    if "icon" in data:
        icon.icon = data["icon"]
    if "size" in data:
        icon.size = data["size"]

    return jsonify({"status": "success", "message": f"Icon {data['id']} updated."})

@app.route("/edit_segment", methods=["POST"])
def edit_segment():
    """
    Edit an existing segment.
    """
    data = request.json
    print("Received data for segment:", data)  # Loguj dane w terminalu

    # Znajdź segment na podstawie ID
    segment_id = data.get("id")
    segment = next((s for s in engine.map_data.segments if s.id == segment_id), None)
    if not segment:
        return jsonify({"status": "error", "message": f"Segment with ID {segment_id} does not exist."}), 404

    # Aktualizuj segment
    if "lines" in data:
        segment.lines = data["lines"]
    if "route" in data:
        segment.route = data["route"]

    return jsonify({"status": "success", "message": f"Segment {segment_id} updated."})

@app.route("/edit_river", methods=["POST"])
def edit_river():
    """
    Edit an existing river.
    """
    data = request.json
    print("Received data for river:", data)  # Loguj dane w terminalu

    river_id = data.get("id")
    river = next((r for r in engine.map_data.rivers if r.river_id == river_id), None)
    if not river:
        return jsonify({"status": "error", "message": f"River with ID {river_id} does not exist."}), 404

    # Aktualizuj właściwości rzeki
    if "label" in data:
        river.label = data["label"]
    if "route" in data:
        river.route = data["route"]
    if "width" in data:
        river.width = data["width"]
    if "color" in data:
        river.color = data["color"]

    return jsonify({"status": "success", "message": f"River {river_id} updated."})

@app.route("/edit_line", methods=["POST"])
def edit_line():
    """
    Edit an existing line.
    """
    data = request.json
    print("Received data for line:", data)  # Loguj dane w terminalu

    line_id = data.get("line_id")
    if not line_id:
        return jsonify({"status": "error", "message": "Line ID is missing."}), 400
    print("line id ", line_id)
    line = engine.map_data.get_line(line_id)
    print(line)
    if not line:
        # Jeśli linia nie istnieje, utwórz nową
        
        engine.add_line(line_id, data.get("label", f"Line {line_id}"),
                         data.get("color", "#000000"), data.get("thickness", 1))
        message = f"Line {line_id} created."
    else:
        # Aktualizuj właściwości linii
        if "label" in data:
            line.label = data["label"]
        if "color" in data:
            line.color = data["color"]
        if "thickness" in data:
            line.thickness = data["thickness"]
        message = f"Line {line_id} updated."


    return jsonify({"status": "success", "message": f"Line {line_id} updated."})

@app.route("/get_map", methods=["GET"])
def get_map():
    """
    Get the current map data.
    """
    nodes = [
        {
            "id": node.id,
            "label": node.label,
            "coordinates": node.coordinates,
            "type": node.type,
            "type_rotation": node.type_rotation,
            "size": node.size,
            "label_position": list(node.label_position),
            "label_text_degree": node.label_text_degree
        }
        for node in engine.map_data.get_all_nodes()
    ]
    segments = [
        {
            "id": segment.id,
            "start_node": segment.start_node.id,
            "end_node": segment.end_node.id,
            "lines": segment.lines,
            "route": segment.route
        }
        for segment in engine.map_data.get_all_segments()
    ]
    rivers = [
        {
            "id": river.river_id,
            "label": river.label,
            "route": river.route,
            "width": river.width,
            "color": river.color
        }
        for river in engine.map_data.get_all_rivers()
    ]
    icons = [
        {
            "id": icon.icon_id,
            "label": icon.label,
            "coordinates": icon.coordinates,
            "icon": icon.icon,
            "size": icon.size
        }
        for icon in engine.map_data.get_all_icons()
    ]
    lines = [
        {
            "line_id": line.line_id,
            "label": line.label,
            "color": line.color,
            "thickness": line.thickness
        }
        for line in engine.map_data.get_all_lines()
    ]

    # Dodanie nowych właściwości do odpowiedzi
    map_settings = {
        "labels_size": engine.map_data.labels_size,
        "labels_color": engine.map_data.labels_color,
        "background_image": engine.map_data.background_image
    }

    return jsonify({
        "nodes": nodes,
        "segments": segments,
        "lines": lines,
        "rivers": rivers,
        "icons": icons,
        **map_settings
    })

@app.route("/edit_map_settings", methods=["POST"])
def edit_map_settings():
    """
    Edit global map settings.
    """
    data = request.json
    print("Received data for map settings:", data)  # Loguj dane w terminalu

    if "labels_size" in data:
        engine.map_data.labels_size = data["labels_size"]
    if "labels_color" in data:
        engine.map_data.labels_color = data["labels_color"]
    if "background_image" in data:
        engine.map_data.background_image = data["background_image"]

    return jsonify({"status": "success", "message": "Map settings updated."})

if __name__ == "__main__":
    app.run(debug=True)