class Node {
    point: number[];
    depth: number;
    left: Node | null;
    right: Node | null;

    constructor(point: number[], depth: number, left: Node | null, right: Node | null) {
        this.point = point;
        this.depth = depth;
        this.left = left;
        this.right = right;
    }
}

class CampusTree {
    private root: Node | null;

    constructor(points: number[][]) {
        this.root = this.buildTree(points, 0);
    }

    buildTree(points: number[][], depth: number): Node | null {
        if (points.length === 0) {
            return null;
        }

        const k = points[0].length;
        const axis = depth % k;
        points.sort((a, b) => a[axis] - b[axis]);
        const medianIndex = Math.floor(points.length / 2);
        const medianPoint = points[medianIndex];

        return new Node(
            medianPoint,
            depth,
            this.buildTree(points.slice(0, medianIndex), depth + 1),
            this.buildTree(points.slice(medianIndex + 1), depth + 1)
        );
    }

    findClosest(query: number[]) {
        let closest = null;
        let shortestDistance = null;
        let node = this.root;

        while (node !== null) {
            const distance = this.getDistance(query, node.point);
            if (shortestDistance === null || distance < shortestDistance) {
                shortestDistance = distance;
                closest = node.point;
            }

            const axis = node.depth % query.length;
            if (query[axis] < node.point[axis]) {
                node = node.left;
            } else {
                node = node.right;
            }
        }

        return closest;
    }

    getDistance(p1: number[], p2: number[]) {
        let sum = 0;
        for (let i = 0; i < p1.length; i++) {
            sum += (p1[i] - p2[i]) ** 2;
        }
        return Math.sqrt(sum);
    }
}

export default CampusTree;
