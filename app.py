from flask import Flask, render_template, request, jsonify, send_from_directory
# from backend.engine import Engine
app = Flask(__name__, static_folder="static", template_folder="templates")
# engine = Engine()
@app.route("/")
def index():
    """
    Render the main page.
    """
    return render_template("index.html")

@app.route("/map.json")
def serve_map():
    """
    Serve the map.json file.
    """
    return send_from_directory("./userdata", "map.json")


if __name__ == "__main__":
    app.run(debug=True)