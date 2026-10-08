import { type Position } from '../types/Position';
import { type ShapeAnimatorInterface } from '.';
export default class MovePointShapeAnimator implements ShapeAnimatorInterface {
    __nativeTag: number;
    constructor(startCoordinate: Position);
    moveTo(args: {
        coordinate: Position;
        durationMs: number;
    }): void;
}
//# sourceMappingURL=MovePointShapeAnimator.d.ts.map