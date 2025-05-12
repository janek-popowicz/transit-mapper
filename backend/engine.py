import json
from mapdata import MapData
from node import Node
from segment import Segment
from segment import Line

class Engine:
    def __init__(self):
        """
        Initialize the Engine with an empty MapData object.
        """
        self.map_data = MapData()

    # Node Operations
    def add_node(self, node_id: str, label: str, coordinates: tuple, node_type: str):
        """
        Add a new node to the map.
        """
        node = Node(node_id, label, coordinates, node_type)
        self.map_data.add_node(node)
        return {"status": "success", "message": f"Node {node_id} added."}

    def edit_node(self, node_id: str, label: str = None, coordinates: tuple = None, node_type: str = None):
        """
        Edit an existing node.
        """
        node = self.map_data.get_node(node_id)
        if not node:
            return {"status": "error", "message": f"Node {node_id} does not exist."}
        if label:
            node.label = label
        if coordinates:
            node.coordinates = coordinates
        if node_type:
            node.type = node_type
        return {"status": "success", "message": f"Node {node_id} updated."}

    def remove_node(self, node_id: str):
        """
        Remove a node from the map.
        """
        if node_id not in self.map_data.nodes:
            return {"status": "error", "message": f"Node {node_id} does not exist."}
        del self.map_data.nodes[node_id]
        # Remove associated segments
        self.map_data.segments = [
            segment for segment in self.map_data.segments
            if segment.start_node.id != node_id and segment.end_node.id != node_id
        ]
        return {"status": "success", "message": f"Node {node_id} removed."}

    # Segment Operations
    def add_segment(self, start_node_id: str, end_node_id: str, lines: list, route: list):
        """
        Add a new segment to the map.
        """
        start_node = self.map_data.get_node(start_node_id)
        end_node = self.map_data.get_node(end_node_id)
        if not start_node or not end_node:
            return {"status": "error", "message": "Start or end node does not exist."}
        segment = Segment(start_node, end_node, lines, route)
        self.map_data.add_segment(segment)
        return {"status": "success", "message": "Segment added."}

    def edit_segment(self, segment_index: int, lines: list = None, route: list = None):
        """
        Edit an existing segment.
        """
        if segment_index < 0 or segment_index >= len(self.map_data.segments):
            return {"status": "error", "message": "Segment index out of range."}
        segment = self.map_data.segments[segment_index]
        if lines:
            segment.lines = lines
        if route:
            segment.route = route
        return {"status": "success", "message": "Segment updated."}

    def remove_segment(self, segment_index: int):
        """
        Remove a segment from the map.
        """
        if segment_index < 0 or segment_index >= len(self.map_data.segments):
            return {"status": "error", "message": "Segment index out of range."}
        del self.map_data.segments[segment_index]
        return {"status": "success", "message": "Segment removed."}

    # Line Operations
    def add_line(self, line_id: str, label: str, color: str):
        """
        Add a new line to the map.
        """
        line = Line(line_id, label, color)
        self.map_data.add_line(line)
        return {"status": "success", "message": f"Line {line_id} added."}

    def edit_line(self, line_id: str, label: str = None, color: str = None):
        """
        Edit an existing line.
        """
        line = self.map_data.get_line(line_id)
        if not line:
            return {"status": "error", "message": f"Line {line_id} does not exist."}
        if label:
            line.label = label
        if color:
            line.color = color
        return {"status": "success", "message": f"Line {line_id} updated."}

    def remove_line(self, line_id: str):
        """
        Remove a line from the map.
        """
        if line_id not in self.map_data.lines:
            return {"status": "error", "message": f"Line {line_id} does not exist."}
        del self.map_data.lines[line_id]
        # Remove the line from all associated segments
        for segment in self.map_data.segments:
            if line_id in segment.lines:
                segment.lines.remove(line_id)
        return {"status": "success", "message": f"Line {line_id} removed."}

    # Import/Export Operations
    def import_from_json(self, json_file: str):
        """
        Import map data from a JSON file.
        """
        with open(json_file, "r") as f:
            data = json.load(f)
        # Add nodes
        for node_data in data.get("nodes", []):
            self.add_node(
                node_data["id"],
                node_data["label"],
                tuple(node_data["coordinates"]),
                node_data["type"]
            )
        # Add lines
        for line_data in data.get("lines", []):
            self.add_line(
                line_data["id"],
                line_data["label"],
                line_data["color"]
            )
        # Add segments
        for segment_data in data.get("segments", []):
            self.add_segment(
                segment_data["start_node"],
                segment_data["end_node"],
                segment_data["lines"],
                segment_data["route"]
            )
        return {"status": "success", "message": "Map data imported from JSON."}

    def export_to_json(self, json_file: str):
        """
        Export map data to a JSON file.
        """
        data = {
            "nodes": [
                {
                    "id": node.id,
                    "label": node.label,
                    "coordinates": node.coordinates,
                    "type": node.type
                }
                for node in self.map_data.get_all_nodes()
            ],
            "lines": [
                {
                    "line_id": line.line_id,
                    "label": line.label,
                    "color": line.color
                }
                for line in self.map_data.get_all_lines()
            ],
            "segments": [
                {
                    "start_node": segment.start_node.id,
                    "end_node": segment.end_node.id,
                    "lines": segment.lines,
                    "route": segment.route
                }
                for segment in self.map_data.get_all_segments()
            ]
        }
        with open(json_file, "w") as f:
            json.dump(data, f, indent=4)
        return {"status": "success", "message": "Map data exported to JSON."}