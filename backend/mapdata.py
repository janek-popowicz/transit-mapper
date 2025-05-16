from backend.node import Node, Icon
from backend.segment import Segment, Line, River

class MapData:
    def __init__(self):
        """
        Initialize the MapData object.
        """
        self.nodes = {}  # Dictionary to store nodes by their ID
        self.segments = []  # List to store all segments
        self.lines = {}  # Dictionary to store lines by their ID
        self.rivers = []  # List to store all rivers
        self.icons = []  # List to store all icons

        # Nowe właściwości mapy
        self.labels_size = 12  # Domyślny rozmiar etykiet
        self.labels_color = "#000000"  # Domyślny kolor etykiet (czarny)
        self.background_image = "None"  # Domyślny brak obrazu tła

    def add_node(self, node: Node):
        """
        Add a node to the map.

        Args:
            node (Node): The node to add.
        """
        if node.id in self.nodes:
            raise ValueError(f"Node with ID {node.id} already exists.")
        self.nodes[node.id] = node

    def add_segment(self, segment: Segment):
        """
        Add a segment to the map.

        Args:
            segment (Segment): The segment to add.
        """
        if segment.start_node.id not in self.nodes or segment.end_node.id not in self.nodes:
            raise ValueError("Both start and end nodes of the segment must exist in the map.")
        self.segments.append(segment)

        # Automatically associate the segment with its lines
        for line_id in segment.get_lines():
            if line_id not in self.lines:
                raise ValueError(f"Line with ID {line_id} does not exist.")
            self.lines[line_id].add_segment(segment)

    def add_line(self, line: Line):
        """
        Add a line to the map.

        Args:
            line (Line): The line to add.
        """
        if line.line_id in self.lines:
            raise ValueError(f"Line with ID {line.line_id} already exists.")
        self.lines[line.line_id] = line

    def add_river(self, river: River):
        """
        Add a river to the map.

        Args:
            river (River): The river to add.
        """
        self.rivers.append(river)

    def add_icon(self, icon: Icon):
        """
        Add an icon to the map.

        Args:
            icon (Icon): The icon to add.
        """
        self.icons.append(icon)

    def get_node(self, node_id: str) -> Node:
        """
        Retrieve a node by its ID.

        Args:
            node_id (str): The ID of the node to retrieve.

        Returns:
            Node: The node with the specified ID.
        """
        return self.nodes.get(node_id, None)

    def get_all_nodes(self):
        """
        Retrieve all nodes in the map.

        Returns:
            list: A list of all nodes.
        """
        return list(self.nodes.values())

    def get_all_segments(self):
        """
        Retrieve all segments in the map.

        Returns:
            list: A list of all segments.
        """
        return self.segments

    def get_line(self, line_id: str) -> Line:
        """
        Retrieve a line by its ID.

        Args:
            line_id (str): The ID of the line to retrieve.

        Returns:
            Line: The line with the specified ID.
        """
        return self.lines.get(line_id, None)

    def get_all_lines(self):
        """
        Retrieve all lines in the map.

        Returns:
            list: A list of all lines.
        """
        return list(self.lines.values())

    def get_all_rivers(self):
        """
        Retrieve all rivers in the map.

        Returns:
            list: A list of all rivers.
        """
        return self.rivers

    def get_all_icons(self):
        """
        Retrieve all icons in the map.

        Returns:
            list: A list of all icons.
        """
        return self.icons

    def get_icon(self, icon_id: str):
        """
        Retrieve an icon by its ID.

        Args:
            icon_id (str): The ID of the icon to retrieve.

        Returns:
            Icon: The icon with the specified ID, or None if not found.
        """
        for icon in self.icons:
            if icon.icon_id == icon_id:
                return icon
        return None