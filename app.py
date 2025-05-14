from flask import Flask, render_template, request, jsonify
from backend.engine import Engine

app = Flask(__name__)
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
            "type": node.type
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
    lines = [
        {
            "line_id": line.line_id,
            "label": line.label,
            "color": line.color,
            "thickness": getattr(line, "thickness", 1)  # Dodaj grubość linii
        }
        for line in engine.map_data.get_all_lines()
    ]
    return jsonify({"nodes": nodes, "segments": segments, "lines": lines})

if __name__ == "__main__":
    app.run(debug=True)