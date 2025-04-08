/**
 * Checks for a collision between a circle and a (possibly rotated) rectangle.
 * Returns an object describing the collision and any impacted edges.
 *
 * This function is fully standalone and uses standard DOM and math operations.
 * It handles rectangle rotation by reverse-rotating the circle's center position
 * to simulate an axis-aligned rectangle, allowing standard bounding box logic.
 *
 * @param {HTMLElement} faCircleElement - The DOM element representing the circle.
 * @param {HTMLElement} faRctElement - The DOM element representing the rectangle.
 * @param {number} [faRectAngle] - Optional angle of rotation in degrees (clockwise).
 *                                  If omitted, the function will attempt to extract the current rotation
 *                                  from the computed CSS transform matrix.
 * @returns {false | Object} Returns `false` if no collision is detected. 
 *                           If collision occurs, returns an object:
 *                           {
 *                             collision: true,
 *                             edge?: true,
 *                             top?: true,
 *                             bottom?: true,
 *                             left?: true,
 *                             right?: true
 *                           }
 */
function circleRectCollision(faCircleElement, faRctElement, faRectAngle) {
    // Get bounding boxes of both elements
    const flCrclParams = faCircleElement.getBoundingClientRect();
    const flRctParams = faRctElement.getBoundingClientRect();

    const flRadius = flCrclParams.width / 2;

    // Get original rectangle size (not affected by rotation)
    const flWidth = faRctElement.offsetWidth;
    const flHeight = faRctElement.offsetHeight;

    // Calculate center of rectangle
    const flRectCenterX = flRctParams.left + flRctParams.width / 2;
    const flRectCenterY = flRctParams.top + flRctParams.height / 2;

    // Calculate center of circle
    let flCircleCenterX = flCrclParams.left + flRadius;
    let flCircleCenterY = flCrclParams.top + flRadius;

    // Determine rotation angle in degrees (clockwise)
    let flAlpha = 0;
    if (typeof faRectAngle === "number") {
        flAlpha = faRectAngle;

  
    } else {
       
        // Attempt to extract rotation angle from CSS transform matrix
        const flStyle = window.getComputedStyle(faRctElement);
        // Check if the element has a transform style applied
        const flCSSmatrix = flStyle.transform;
        // If the element has a transform matrix.
        if (flCSSmatrix !== 'none') {
        // Extract the matrix values using regex
        // The regex captures the matrix values in a group and splits them into an array
        const values = flCSSmatrix.match(/matrix\(([^)]+)\)/)[1].split(', ');

        // Convert the first two values to floats (a and b in the matrix)
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        //calculate the angle in degrees using atan2
        flAlpha = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        // Normalize the angle to be in the range [0, 360)
        if (flAlpha < 0) flAlpha += 360;
        }    
    }

    // Early exit if no rotation and circle is clearly outside the rectangle's AABB (plus radius buffer)
    if (
        flAlpha === 0 &&
        !(
            flCircleCenterX >= flRctParams.left - flRadius &&
            flCircleCenterX <= flRctParams.right + flRadius &&
            flCircleCenterY >= flRctParams.top - flRadius &&
            flCircleCenterY <= flRctParams.bottom + flRadius
        )
    ) return false;

    // Rotate circle coordinates into unrotated rectangle space (if rotated)
    if (flAlpha !== 0) {
        const dx = flCircleCenterX - flRectCenterX;
        const dy = flCircleCenterY - flRectCenterY;

        const flAngleRad = flAlpha * (Math.PI / 180);

        const flRotatedX = Math.cos(-flAngleRad) * dx - Math.sin(-flAngleRad) * dy + flRectCenterX;
        const flRotatedY = Math.sin(-flAngleRad) * dx + Math.cos(-flAngleRad) * dy + flRectCenterY;

        flCircleCenterX = flRotatedX;
        flCircleCenterY = flRotatedY;
    }

    // Axis-aligned rectangle bounds
    const flLeft = flRectCenterX - flWidth / 2;
    const flRight = flRectCenterX + flWidth / 2;
    const flTop = flRectCenterY - flHeight / 2;
    const flBottom = flRectCenterY + flHeight / 2;

    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(flLeft, Math.min(flCircleCenterX, flRight));
    const closestY = Math.max(flTop, Math.min(flCircleCenterY, flBottom));

    // Measure distance from the circle center to the closest point
    const fldx = flCircleCenterX - closestX;
    const fldy = flCircleCenterY - closestY;

    if (fldx * fldx + fldy * fldy < flRadius * flRadius) {
        const flCollision = {
            // If we are here the collision has happend. 
            collision: true,
            // if no edge is touched, it means the circle is inside the rectangle
            edge: false,
        };

        // Optional: edge detection
        // Multiple edges can be touched at once, so separate if statements
        if (closestX === flCircleCenterX && closestY === flTop) {
            flCollision.edge = true;
            flCollision.top = true;
        }
        if (closestX === flCircleCenterX && closestY === flBottom) {
            flCollision.edge = true;
            flCollision.bottom = true;
        }
        if (closestY === flCircleCenterY && closestX === flLeft) {
            flCollision.edge = true;
            flCollision.left = true;
        }
        if (closestY === flCircleCenterY && closestX === flRight) {
            flCollision.edge = true;
            flCollision.right = true;
        }

        return flCollision;
    }

    return false;
}


export { circleRectCollision };