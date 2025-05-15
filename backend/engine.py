import json
from backend.mapdata import MapData
from backend.node import Node
from backend.node import Icon
from backend.segment import Segment
from backend.segment import Line
from backend.segment import River

class Engine:
    def __init__(self):
        """
        Initialize the Engine with an empty MapData object and load data from map.json.
        """
        self.map_data = MapData()
        self.import_from_json("userdata/map.json")  # Wczytaj dane z map.json

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
    def add_line(self, line_id: str, label: str, color: str, thickness: int = 1):
        """
        Add a new line to the map.
        """
        line = Line(line_id, label, color, thickness)
        self.map_data.add_line(line)
        return {"status": "success", "message": f"Line {line_id} added."}

    def edit_line(self, line_id: str, label: str = None, color: str = None, thickness: int = None):
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
        if thickness is not None:
            line.thickness = thickness
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

        # Wczytaj właściwości mapy
        self.map_data.labels_size = data.get("labels_size", 12)  # Domyślny rozmiar etykiet
        self.map_data.labels_color = data.get("labels_color", "#000000")  # Domyślny kolor etykiet
        self.map_data.background_image = data.get("background_image", "None")  # Domyślny brak obrazu tła

        # Add nodes
        for node_data in data.get("nodes", []):
            node = Node(
                id=node_data["id"],
                label=node_data["label"],
                coordinates=tuple(node_data["coordinates"]),
                type=node_data["type"],
                type_rotation=node_data.get("type_rotation", 0),
                size=node_data.get("size", 10),
                label_position=tuple(node_data.get("label_position", (10, 10))),
                label_text_degree=node_data.get("label_text_degree", 90)
            )
            self.map_data.add_node(node)
        # Add lines
        for line_data in data.get("lines", []):
            self.add_line(
                line_data["id"],
                line_data["label"],
                line_data["color"],
                line_data.get("thickness", 1)
            )
        # Add segments
        for segment_data in data.get("segments", []):
            self.add_segment(
                segment_data["start_node"],
                segment_data["end_node"],
                segment_data["lines"],
                segment_data["route"]
            )
        # Add rivers
        for river_data in data.get("rivers", []):
            river = River(
                river_id=river_data["id"],
                label=river_data["label"],
                route=river_data["route"],
                width=river_data["width"],
                color=river_data["color"]
            )
            self.map_data.add_river(river)
        # Add icons
        for icon_data in data.get("icons", []):
            icon = Icon(
                icon_id=icon_data["id"],
                label=icon_data["label"],
                coordinates=tuple(icon_data["coordinates"]),
                icon=icon_data["icon"],
                size=icon_data["size"]
            )
            self.map_data.add_icon(icon)
        return {"status": "success", "message": "Map data imported from JSON."}

    def export_to_json(self, json_file: str):
        """
        Export map data to a JSON file.
        """
        data = {
            "labels_size": self.map_data.labels_size,
            "labels_color": self.map_data.labels_color,
            "background_image": self.map_data.background_image,
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
                    "color": line.color,
                    "thickness": line.thickness
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
            ],
            "rivers": [
                {
                    "id": river.river_id,
                    "label": river.label,
                    "route": river.route,
                    "width": river.width,
                    "color": river.color
                }
                for river in self.map_data.get_all_rivers()
            ],
            "icons": [
                {
                    "id": icon.icon_id,
                    "label": icon.label,
                    "coordinates": icon.coordinates,
                    "icon": icon.icon,
                    "size": icon.size
                }
                for icon in self.map_data.get_all_icons()
            ]
        }
        with open(json_file, "w") as f:
            json.dump(data, f, indent=4)
        return {"status": "success", "message": "Map data exported to JSON."}