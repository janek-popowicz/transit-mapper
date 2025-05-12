import matplotlib.pyplot as plt
from backend.engine import Engine

def visualize_map(engine: Engine):
    """
    Visualize the map using the Engine instance.
    """
    # Create a new plot
    plt.figure(figsize=(10, 8))
    plt.title("Transit Map Visualization")
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")

    # Plot nodes
    for node in engine.map_data.get_all_nodes():
        x, y = node.coordinates
        plt.scatter(x, y, label=node.label, s=100, zorder=2)
        plt.text(x, y, f"{node.label} ({node.id})", fontsize=9, ha="right")

    # Plot segments
    for segment in engine.map_data.get_all_segments():
        route_x = [point[0] for point in segment.route]
        route_y = [point[1] for point in segment.route]
        for line_id in segment.lines:
            line = engine.map_data.get_line(line_id)
            if line:
                plt.plot(route_x, route_y, label=f"{line.label} ({line_id})", color=line.color, zorder=1)

    # Add legend and grid
    plt.legend()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    # Initialize the engine
    engine = Engine()

    # Import map data from JSON
    engine.import_from_json("map.json")

    # Visualize the map
    visualize_map(engine)