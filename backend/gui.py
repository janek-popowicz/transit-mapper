import tkinter as tk
from tkinter import messagebox
from backend.engine import Engine
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

class MapEditor:
    def __init__(self, root):
        self.engine = Engine()
        self.root = root
        self.root.title("Transit Map Editor")

        # Left Frame for Inputs
        self.left_frame = tk.Frame(root)
        self.left_frame.pack(side=tk.LEFT, padx=10, pady=10)

        # Right Frame for Visualization
        self.right_frame = tk.Frame(root)
        self.right_frame.pack(side=tk.RIGHT, padx=10, pady=10)

        # Node Input
        tk.Label(self.left_frame, text="Node ID:").grid(row=0, column=0)
        self.node_id_entry = tk.Entry(self.left_frame)
        self.node_id_entry.grid(row=0, column=1)

        tk.Label(self.left_frame, text="Label:").grid(row=1, column=0)
        self.node_label_entry = tk.Entry(self.left_frame)
        self.node_label_entry.grid(row=1, column=1)

        tk.Label(self.left_frame, text="Coordinates (lat, lon):").grid(row=2, column=0)
        self.node_coords_entry = tk.Entry(self.left_frame)
        self.node_coords_entry.grid(row=2, column=1)

        tk.Label(self.left_frame, text="Type:").grid(row=3, column=0)
        self.node_type_entry = tk.Entry(self.left_frame)
        self.node_type_entry.grid(row=3, column=1)

        tk.Button(self.left_frame, text="Add Node", command=self.add_node).grid(row=4, column=0, columnspan=2)

        # Segment Input
        tk.Label(self.left_frame, text="Start Node ID:").grid(row=5, column=0)
        self.start_node_entry = tk.Entry(self.left_frame)
        self.start_node_entry.grid(row=5, column=1)

        tk.Label(self.left_frame, text="End Node ID:").grid(row=6, column=0)
        self.end_node_entry = tk.Entry(self.left_frame)
        self.end_node_entry.grid(row=6, column=1)

        tk.Label(self.left_frame, text="Line IDs (comma-separated):").grid(row=7, column=0)
        self.line_ids_entry = tk.Entry(self.left_frame)
        self.line_ids_entry.grid(row=7, column=1)

        tk.Label(self.left_frame, text="Route (lat, lon pairs; semicolon-separated):").grid(row=8, column=0)
        self.route_entry = tk.Entry(self.left_frame)
        self.route_entry.grid(row=8, column=1)

        tk.Button(self.left_frame, text="Add Segment", command=self.add_segment).grid(row=9, column=0, columnspan=2)

        # Line Input
        tk.Label(self.left_frame, text="Line ID:").grid(row=10, column=0)
        self.line_id_entry = tk.Entry(self.left_frame)
        self.line_id_entry.grid(row=10, column=1)

        tk.Label(self.left_frame, text="Label:").grid(row=11, column=0)
        self.line_label_entry = tk.Entry(self.left_frame)
        self.line_label_entry.grid(row=11, column=1)

        tk.Label(self.left_frame, text="Color:").grid(row=12, column=0)
        self.line_color_entry = tk.Entry(self.left_frame)
        self.line_color_entry.grid(row=12, column=1)

        tk.Button(self.left_frame, text="Add Line", command=self.add_line).grid(row=13, column=0, columnspan=2)

        # Save and Load Buttons
        tk.Button(self.left_frame, text="Save Map", command=self.save_map).grid(row=14, column=0, columnspan=2)
        tk.Button(self.left_frame, text="Load Map", command=self.load_map).grid(row=15, column=0, columnspan=2)

        # Visualization Canvas
        self.figure = plt.Figure(figsize=(6, 6), dpi=100)
        self.ax = self.figure.add_subplot(111)
        self.canvas = FigureCanvasTkAgg(self.figure, self.right_frame)
        self.canvas.get_tk_widget().pack()

        # Initial Visualization
        self.update_visualization()

    def update_visualization(self):
        """
        Update the visualization with the current map data.
        """
        self.ax.clear()
        self.ax.set_title("Transit Map Visualization")
        self.ax.set_xlabel("Longitude")
        self.ax.set_ylabel("Latitude")

        # Plot nodes
        for node in self.engine.map_data.get_all_nodes():
            x, y = node.coordinates
            self.ax.scatter(x, y, label=node.label, s=100, zorder=2)
            self.ax.text(x, y, f"{node.label} ({node.id})", fontsize=9, ha="right")

        # Plot segments
        for segment in self.engine.map_data.get_all_segments():
            route_x = [point[0] for point in segment.route]
            route_y = [point[1] for point in segment.route]
            for line_id in segment.lines:
                line = self.engine.map_data.get_line(line_id)
                if line:
                    self.ax.plot(route_x, route_y, label=f"{line.label} ({line_id})", color=line.color, zorder=1)

        self.ax.legend()
        self.ax.grid(True)
        self.canvas.draw()

    def add_node(self):
        try:
            node_id = self.node_id_entry.get()
            label = self.node_label_entry.get()
            coordinates = tuple(map(float, self.node_coords_entry.get().split(',')))
            node_type = self.node_type_entry.get()
            result = self.engine.add_node(node_id, label, coordinates, node_type)
            messagebox.showinfo("Success", result["message"])
            self.update_visualization()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def add_segment(self):
        try:
            start_node_id = self.start_node_entry.get()
            end_node_id = self.end_node_entry.get()
            line_ids = self.line_ids_entry.get().split(',')
            route = [tuple(map(float, coord.split(','))) for coord in self.route_entry.get().split(';')]
            result = self.engine.add_segment(start_node_id, end_node_id, line_ids, route)
            messagebox.showinfo("Success", result["message"])
            self.update_visualization()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def add_line(self):
        try:
            line_id = self.line_id_entry.get()
            label = self.line_label_entry.get()
            color = self.line_color_entry.get()
            result = self.engine.add_line(line_id, label, color)
            messagebox.showinfo("Success", result["message"])
            self.update_visualization()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def save_map(self):
        try:
            result = self.engine.export_to_json("map.json")
            messagebox.showinfo("Success", result["message"])
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def load_map(self):
        try:
            result = self.engine.import_from_json("map.json")
            messagebox.showinfo("Success", result["message"])
            self.update_visualization()
        except Exception as e:
            messagebox.showerror("Error", str(e))

def main():
    root = tk.Tk()
    app = MapEditor(root)
    root.mainloop()