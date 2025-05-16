from backend.node import Node

class Segment:
    def __init__(self, id, start_node: Node, end_node: Node, lines: list, route: list):
        """
        Initialize a Segment object.

        Args:
            start_node (Node): Start node object.
            end_node (Node): End node object.
            lines (list): List of line IDs associated with this segment.
            route (list): List of coordinates on the route. Must start with start_node's coords and end with end_node's coords.
        """
        self.id = id
        self.start_node = start_node
        self.end_node = end_node
        self.lines = lines  # List of line IDs
        self.start_coordinates = start_node.coordinates
        self.end_coordinates = end_node.coordinates
        self.route = route

    def add_line(self, line_id: str):
        """
        Add a line to the segment.

        Args:
            line_id (str): The line ID to add.
        """
        if line_id not in self.lines:
            self.lines.append(line_id)

    def get_lines(self):
        """
        Retrieve all lines associated with the segment.

        Returns:
            list: A list of all line IDs.
        """
        return self.lines


class Line:
    def __init__(self, line_id: str, label: str, color: str, thickness: int = 1):
        """
        Initialize a Line object.

        Args:
            line_id (str): Unique identifier for the line.
            label (str): Label for the line.
            color (str): Color of the line (e.g., hex code or color name).
            thickness (int): Thickness of the line.
        """
        self.line_id = line_id
        self.label = label
        self.color = color
        self.thickness = thickness  # Dodaj grubość linii
        self.segments = []  # List of segments in the line

    def add_segment(self, segment: Segment):
        """
        Add a segment to the line.

        Args:
            segment (Segment): The segment to add.
        """
        if self.line_id not in segment.get_lines():
            raise ValueError(f"Segment does not belong to line {self.line_id}.")
        self.segments.append(segment)

    def get_segments(self):
        """
        Retrieve all segments in the line.

        Returns:
            list: A list of all segments.
        """
        return self.segments


class River:
    def __init__(self, river_id: str, label: str, route: list, width: int, color: str):
        """
        Initialize a River object.

        Args:
            river_id (str): Unique identifier for the river.
            label (str): Label for the river.
            route (list): List of coordinates defining the river's path.
            width (int): Width of the river in pixels.
            color (str): Color of the river (e.g., hex code or color name).
        """
        self.river_id = river_id
        self.label = label
        self.route = route
        self.width = width
        self.color = color