const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

interface Point {
    x: number;
    y: number;
}

interface Line {
    p1: Point;
    p2: Point;
}

function getRandomPointOnSide(sideLength: number): Point {
    const side = Math.floor(Math.random() * 4);
    const pos = Math.random() * sideLength;

    switch (side) {
        case 0: return { x: pos, y: 0 }; // Top
        case 1: return { x: sideLength, y: pos }; // Right
        case 2: return { x: pos, y: sideLength }; // Bottom
        case 3: return { x: 0, y: pos }; // Left
        default: return { x: 0, y: 0 };
    }
}

function drawLine(line: Line) {
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(line.p1.x, line.p1.y);
        ctx.lineTo(line.p2.x, line.p2.y);
        ctx.stroke();
    }
}

function findIntersection(line1: Line, line2: Line): Point | null {
    const { x: x1, y: y1 } = line1.p1;
    const { x: x2, y: y2 } = line1.p2;
    const { x: x3, y: y3 } = line2.p1;
    const { x: x4, y: y4 } = line2.p2;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null;

    const intersectX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const intersectY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    if (intersectX < 0 || intersectX > canvas.width || intersectY < 0 || intersectY > canvas.height) {
        return null;
    }

    return { x: intersectX, y: intersectY };
}

function pointsEqual(p1: Point, p2: Point): boolean {
    return p1.x === p2.x && p1.y === p2.y;
}

// Простий алгоритм для знаходження фігур
function findPolygons(edges: Line[], points: Point[]): Point[][] {
    const polygons: Point[][] = [];

    // Наївний підхід: всмоктування полігонів з точок перетину
    for (const start of points) {
        const polygon: Point[] = [start];
        let current = start;

        while (true) {
            const nextEdge = edges.find(edge =>
                (pointsEqual(edge.p1, current) && !polygon.includes(edge.p2)) ||
                (pointsEqual(edge.p2, current) && !polygon.includes(edge.p1))
            );

            if (!nextEdge) break;

            current = pointsEqual(nextEdge.p1, current) ? nextEdge.p2 : nextEdge.p1;
            polygon.push(current);

            if (pointsEqual(current, start)) {
                polygons.push(polygon);
                break;
            }
        }
    }

    return polygons;
}

function divideSquare() {
    const sideLength = canvas.width;

    // Clear the canvas
    if (ctx) {
        ctx.clearRect(0, 0, sideLength, sideLength);

        // Draw the square
        ctx.strokeRect(0, 0, sideLength, sideLength);

        // Draw random lines
        const numberOfLines = 5; // You can change this value to draw more lines
        const lines: Line[] = [];
        for (let i = 0; i < numberOfLines; i++) {
            const p1 = getRandomPointOnSide(sideLength);
            let p2: Point;
            do {
                p2 = getRandomPointOnSide(sideLength);
            } while ((p1.x === p2.x && p1.y === p2.y) || // Same point
                     (p1.x === 0 && p2.x === 0) || // Same vertical side (left)
                     (p1.x === sideLength && p2.x === sideLength) || // Same vertical side (right)
                     (p1.y === 0 && p2.y === 0) || // Same horizontal side (top)
                     (p1.y === sideLength && p2.y === sideLength)); // Same horizontal side (bottom)

            const line = { p1, p2 };
            lines.push(line);
            drawLine(line);
        }

        // Find and draw intersection points
        ctx.fillStyle = 'red';
        const points: Point[] = [];
        for (let i = 0; i < lines.length; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                const intersection = findIntersection(lines[i], lines[j]);
                if (intersection) {
                    points.push(intersection);
                    ctx.fillRect(intersection.x - 2, intersection.y - 2, 4, 4);
                }
            }
        }

        // Draw corner points
        ctx.fillStyle = 'blue';
        const corners: Point[] = [
            { x: 0, y: 0 },
            { x: sideLength, y: 0 },
            { x: sideLength, y: sideLength },
            { x: 0, y: sideLength }
        ];
        corners.forEach(corner => {
            points.push(corner);
            ctx.fillRect(corner.x - 2, corner.y - 2, 4, 4);
        });

        // Draw intersection points with the edges
        ctx.fillStyle = 'green';
        lines.forEach(line => {
            [line.p1, line.p2].forEach(point => {
                if (point.x === 0 || point.y === 0 || point.x === sideLength || point.y === sideLength) {
                    points.push(point);
                    ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
                }
            });
        });

        // Sort points by ascending order
        points.sort((a, b) => {
            if (a.x === b.x) {
                return a.y - b.y;
            }
            return a.x - b.x;
        });

        console.log('Sorted points:', points);

        // Find polygons
        const polygons = findPolygons(lines, points);

        // Draw polygons
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        polygons.forEach(polygon => {
            ctx.beginPath();
            ctx.moveTo(polygon[0].x, polygon[0].y);
            polygon.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.closePath();
            ctx.fill();
        });
    }
}

// Initial division
divideSquare();
