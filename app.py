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

if __name__ == "__main__":
    app.run(debug=True)