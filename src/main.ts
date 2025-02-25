class Point {
    constructor(public x: number, public y: number) {}
}

class Line {
    constructor(public start: Point, public end: Point) {}
}

class Shape {
    constructor(public points: Point[], public center: Point, public color: string) {}
}

// Function to generate random points on the sides of the square
function randomPointOnSide(size: number): Point {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: return new Point(Math.random() * size, 0); // Top
        case 1: return new Point(size, Math.random() * size); // Right
        case 2: return new Point(Math.random() * size, size); // Bottom
        case 3: return new Point(0, Math.random() * size); // Left
        default: return new Point(0, 0); // Should never reach here
    }
}

// Function to create lines that divide the square
function createLines(size: number, linesCount: number): Line[] {
    let lines: Line[] = [];
    for (let i = 0; i < linesCount; i++) {
        const start = randomPointOnSide(size);
        const end = randomPointOnSide(size);
        lines.push(new Line(start, end));
    }
    return lines;
}

// Function to calculate the center of a polygon
function calculateCenter(points: Point[]): Point {
    let xSum = 0, ySum = 0;
    points.forEach(point => {
        xSum += point.x;
        ySum += point.y;
    });
    return new Point(xSum / points.length, ySum / points.length);
}

// Function to generate a random color
function randomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to create shapes by dividing the square
function createShapes(size: number, linesCount: number): Shape[] {
    const lines = createLines(size, linesCount);
    let shapes: Shape[] = [];

    // Simple approach to create shapes (polygonal areas formed by the lines)
    // This part could be more complex depending on how you'd want to calculate intersections
    // For simplicity, assume every shape is a polygon defined by random lines
    for (let i = 0; i < linesCount; i++) {
        let shapePoints = [
            lines[i].start,
            lines[i].end,
            randomPointOnSide(size),
            randomPointOnSide(size),
        ];
        let center = calculateCenter(shapePoints);
        let color = randomColor(); // Assign a random color
        shapes.push(new Shape(shapePoints, center, color));
    }
    return shapes;
}

// Function to animate scaling of shapes
function animateScaling(ctx: CanvasRenderingContext2D, shapes: Shape[], scaleFactor: number, duration: number) {
    const frames = 60;
    const step = scaleFactor / frames;
    let currentScale = 1;

    function draw() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        shapes.forEach(shape => {
            // Scale and fill each shape with the color
            ctx.beginPath();
            ctx.fillStyle = shape.color; // Use the shape's color for filling
            shape.points.forEach((point, index) => {
                let scaledX = (point.x - shape.center.x) * currentScale + shape.center.x;
                let scaledY = (point.y - shape.center.y) * currentScale + shape.center.y;
                if (index === 0) {
                    ctx.moveTo(scaledX, scaledY);
                } else {
                    ctx.lineTo(scaledX, scaledY);
                }
            });
            ctx.closePath();
            ctx.fill(); // Fill the shape with color
        });

        currentScale += step;
        if (currentScale < scaleFactor) {
            requestAnimationFrame(draw);
        }
    }

    draw();
}

// Initialize canvas and context
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
canvas.width = 600;
canvas.height = 600;

// Create shapes and start animation
const shapes = createShapes(600, 5); // Example: 5 lines to create shapes
animateScaling(ctx, shapes, 4, 2000); // Scale by factor of 4 over 2 seconds
