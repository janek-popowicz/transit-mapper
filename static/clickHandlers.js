export function getMapCoordinatesFromClick(e, canvas, offsetX, offsetY, scale) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // Transformacja do układu mapy
    const mapX = (canvasX - canvas.width / 2 - offsetX) / (scale * 50);
    const mapY = -(canvasY - canvas.height / 2 - offsetY) / (scale * 50);

    return [mapX, mapY];
}


export function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) {
        return Math.hypot(px - x1, py - y1);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
}
