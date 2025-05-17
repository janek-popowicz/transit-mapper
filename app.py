import os
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="static", template_folder="templates")

# Directory to store uploaded icons
UPLOAD_FOLDER = os.path.join(app.static_folder, "icons")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

@app.route("/upload-icon", methods=["POST"])
def upload_icon():
    if "icon" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["icon"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(".svg"):
        return jsonify({"error": "Only SVG files are allowed"}), 400

    # Save the file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    return jsonify({"message": "Icon uploaded successfully", "path": f"/static/icons/{file.filename}"}), 200

if __name__ == "__main__":
    app.run(debug=True)