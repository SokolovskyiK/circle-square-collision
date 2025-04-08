





class DaElement {

       constructor(faTag, faClass){ 

        // Create main tag
        this.daMainTag = document.createElement(faTag);

        if (faClass) this.daSetClass(faClass);
    
    };

     elementType(faInst){

        if (faInst instanceof DaElement) return "DaElement"
        else if (faInst instanceof HTMLElement) return "HTMLElement"
        else return false;
    };

    isString(...args){

        for (let i = 0; i < args.length; i++) {
            if (!typeof args[i] === "string") {
              console.warn(`Argument at index ${i} - ${args[i]} is not a string:` );
              console.trace();
              return false;
            }
          };
          return true;
    };

    isNumber(...args){

        for (let i = 0; i < args.length; i++) {
            if (!typeof args[i] === "number") {
              console.warn(`Argument at index ${i} - ${args[i]} is not a number:` );
              console.trace();
              return false;
            }
          };
          return true;
    };

    isBooleanl(...args){

        for (let i = 0; i < args.length; i++) {
            if (!typeof args[i] === "boolean") {
              console.warn(`Argument at index ${i} - ${args[i]} is NOT boolean` );
              console.trace();
              return false;
            }
          };
          return true;
    };

    degToRadians(faDeg){
        return faDeg * (Math.PI / 180);
    };

    radiansToDeg(faRad){
       return faRad * (180 / Math.PI);
    };

    sin(faDeg){
       return  Math.sin(this.degToRadians(faDeg));
    };

    cos(faDeg){
        return  Math.cos(this.degToRadians(faDeg));
     };

    getVectorXY(faLength, faAngleDeg) {

      this.isNumber(faLength, faAngleDeg);

        const flXRaw = faLength * this.cos(faAngleDeg);
        const flYRaw = faLength * this.sin(faAngleDeg);

        const epsilon = 1e-10; // Precision threshold

        const flX = Math.abs(flXRaw) < epsilon ? 0 : flXRaw;
        const flY = Math.abs(flYRaw) < epsilon ? 0 : flYRaw;

        return { flX, flY };
    };

    getReflectedAngle(faAngleDeg, faAxis) {

        let angle = ((faAngleDeg % 360) + 360) % 360;

        let reflected;
        if (faAxis === 'horizontal') {
            reflected = (360 - angle + 180) % 360;
        } else {

            reflected = (360 - angle) % 360;
        }
        return reflected;
    };


    executeInNextFrame(faCallBack) { 
        requestAnimationFrame( () => requestAnimationFrame(faCallBack));};
 
    daAppend(faInst){
        this.daMainTag.append(faInst.daMainTag)
    };

    daSetClass(faClass){
         this.daMainTag.setAttribute("class", faClass);
    };


    daAddClass(faClass){
        if(this.daMainTag.classList.contains(faClass)){
            console.warn(`the class "${faClass}" already exists.`)
return
        };

        this.daMainTag.classList.add(faClass);
    };


    daRemoveClass(faClass){
        if(!this.daMainTag.classList.contains(faClass)){
return;

        };

        this.daMainTag.classList.remove(faClass);
    };

   
    
    daAddStyle(faStyle, faValue){

        if (!this.isString(faStyle) || !this.isString(faValue)) return;

        this.daMainTag.style[faStyle] = faValue;
    };

    daGetOffsetParams(){
        return {
            left: this.daMainTag.offsetLeft, 
            top: this.daMainTag.offsetTop,
            width : this.daMainTag.offsetWidth,
            height : this.daMainTag.offsetHeight,
            offsetParent : this.daMainTag.offsetParent
        }
    }
    daGetSizeParameters(){
        return this.daMainTag.getBoundingClientRect();
    };
   




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
circleRectCollision(faCircleElement, faRctElement, faRectAngle) {
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




 /**
 * Moves an element using `style.left` and `style.top`.
 * 
 * Accepts either raw (X, Y) deltas or a movement vector (length + angle).
 * Supports percent-based movement (relative to parent width), and includes
 * sub-pixel accumulator logic for smooth motion.
 * 
 *  Notes on framework usage:
 * - `this.daMainTag` is a reference to a native DOM element [standard DOM via framework]
 * - `getVectorXY()`, `isNumber()`, `isBooleanl()` are utility methods from your custom framework
 * 
 * @param {number} faLengthOrX - Either X-delta or vector length
 * @param {number} faAngleDegOrY - Either Y-delta or vector angle in degrees
 * @param {boolean} [faIsVector=false] - If true, interpret inputs as vector (length + angle)
 * @param {boolean} [faUsePercentOfParent=false] - If true, interpret values as percent of parent width
 * @param {number} [faMinimalMovement=1] - Minimum pixel threshold before movement is applied
 * @returns {Object} Coordinates after movement { x, y }
 */
daMoveStyle(faLengthOrX, faAngleDegOrY, faIsVector = false, faUsePercentOfParent = false, faMinimalMovement = 1) {

        // Validate types using framework utility functions [custom framework]
        this.isNumber(faLengthOrX, faAngleDegOrY);
        this.isBooleanl(faIsVector, faUsePercentOfParent);

        // Get offset parent (relative movement context)
        // `daMainTag` is a DOM element accessed through the framework [standard DOM via framework]
        const flParent = this.daMainTag.offsetParent;
        if (!flParent) {
            throw new Error("daMoveStyle: Element has no offsetParent — cannot calculate relative position.");
        }

        let flX, flY;

        // --- Handle vector-based movement ---
        if (faIsVector) {
            let flActualLength = faLengthOrX;

            // Convert length from % of parent width to pixels
            if (faUsePercentOfParent) {
                const flParentWidth = flParent.offsetWidth;
                flActualLength = (faLengthOrX / 100) * flParentWidth;
            }

            // Use custom framework utility to get X and Y deltas from angle and length [custom framework]
            ({ flX, flY } = this.getVectorXY(flActualLength, faAngleDegOrY));

        } else {
            // --- Handle direct XY movement ---
            const flParentWidth = flParent.offsetWidth;

            flX = faUsePercentOfParent
                ? (faLengthOrX / 100) * flParentWidth
                : faLengthOrX;

            flY = faUsePercentOfParent
                ? (faAngleDegOrY / 100) * flParentWidth
                : faAngleDegOrY;
        }

        // Initialize sub-pixel accumulators if undefined [custom logic]
        if (this.accumulatorX === undefined) this.accumulatorX = 0;
        if (this.accumulatorY === undefined) this.accumulatorY = 0;

        // Accumulate fractional movement
        this.accumulatorX += flX;
        this.accumulatorY += flY;

        // Get current element position relative to parent [standard DOM via framework]
        const flRelativeX = this.daMainTag.offsetLeft;
        const flRelativeY = this.daMainTag.offsetTop;

        const fLnewCoords = { x: flRelativeX, y: flRelativeY };

        // ======== X Movement ========
        if (Math.abs(this.accumulatorX) >= faMinimalMovement) {
            const flLeftover = this.accumulatorX % faMinimalMovement;
            const flMoveX = this.accumulatorX - flLeftover;

            const flNewX = flRelativeX + flMoveX;
            this.daMainTag.style.left = `${flNewX}px`; // Update position [standard DOM via framework]

            this.accumulatorX = flLeftover;
            fLnewCoords.x = flNewX;
        }

        // ======== Y Movement ========
        if (Math.abs(this.accumulatorY) >= faMinimalMovement) {
            const flLeftover = this.accumulatorY % faMinimalMovement;
            const flMoveY = this.accumulatorY - flLeftover;

            const flNewY = flRelativeY + flMoveY;
            this.daMainTag.style.top = `${flNewY}px`; // Update position [standard DOM via framework]

            this.accumulatorY = flLeftover;
            fLnewCoords.y = flNewY;
        }

        return fLnewCoords;
    }       

};

class DaDiv extends DaElement {
    constructor(faClass) {super(`div`, faClass);};
};


class DaBrick extends DaElement{
    constructor(faClass) {super("div", faClass);};   
};

class DaCircle extends DaElement{

    vectorSpeed = 0.5; //Percents
    vectorAngle = 20; // Degrees

    radiusInPercents = 2;
    
    // Absolute coordinates
    ballX = 0;
    ballY = 0;

    // Will be defined after rendering in DOM.
    radius;

    constructor() {
        super("div", "crc-ball");
    
        this.daAddStyle("width",`${this.radiusInPercents*2}%`);

        // Have to execute it in next frame to get parameters after container is rendered in the DOM.
        this.executeInNextFrame(()=> this.radius = this.daGetSizeParameters().width/2);
        // Change the parameters if window is resized.
        window.addEventListener("resize",()=>this.radius = this.daGetSizeParameters().width/2);
    };   

};



export class DaSQCollision extends DaElement {

    
    constructor() {

        super('div', "crc-main-container");

        this.block = new DaDiv("crc-main-border");

        this.ball = new DaCircle("crc-ball");

        this.brick = new DaBrick("crc-brick");

        this.brickCover = new DaDiv("crc-brick-cover");


        // Have to execute it in next frame to get parameters after container is rendered in the DOM.
        this.executeInNextFrame(()=>this.containerSizeParams = this.block.daGetSizeParameters());
        window.addEventListener("resize",()=>this.containerSizeParams = this.block.daGetSizeParameters());
        // Set the ball position in the center of the block.        
        this.daAppend(this.block);

        this.brick.daAppend(this.brickCover);
        this.block.daAppend(this.ball);
        this.block.daAppend( this.brick);

        this.executeInNextFrame(()=>this.iterate());
    };


    getBallPostion(){

        const flBallRect = this.ball.daGetSizeParameters();

        this.ballX = flBallRect.left + flBallRect.width/2;
        this.ballY = flBallRect.top + flBallRect.height/2;
    };

    checkBoundary(){
        const flOffsetParams = this.ball.daGetOffsetParams();

        if (flOffsetParams.left < 0
            && this.ball.vectorAngle > 90 && this.ball.vectorAngle < 270) {

            this.ball.vectorAngle = this.ball.getReflectedAngle(this.ball.vectorAngle, "horizontal");
            return;
        }


        else if (flOffsetParams.left + flOffsetParams.width > this.containerSizeParams.width 
                && (this.ball.vectorAngle > 270 && this.ball.vectorAngle < 360 ||  this.ball.vectorAngle > 0 && this.ball.vectorAngle < 90 )){
                this.ball.vectorAngle = this.ball.getReflectedAngle(this.ball.vectorAngle, "horizontal");
                return;
        }

        if (flOffsetParams.top < 0  
            && this.ball.vectorAngle >= 180  && this.ball.vectorAngle <= 360   ){
                this.ball.vectorAngle = this.ball.getReflectedAngle(this.ball.vectorAngle, "vertical");
            return;
        }

        else if ( flOffsetParams.top + flOffsetParams.height > this.containerSizeParams.height
                && this.ball.vectorAngle > 0 && this.ball.vectorAngle <= 180)
            {
                console.log('here');
            this.ball.vectorAngle = this.ball.getReflectedAngle(this.ball.vectorAngle, "vertical");
            return;

        };
       };

    
    iterate(){

         requestAnimationFrame(()=>{

            this.checkBoundary();   
            const flCollision = this.circleRectCollision(this.ball.daMainTag, this.brick.daMainTag);
            
           if (this.brickCover.currentShadow) this.brickCover.daRemoveClass(this.brickCover.currentShadow)
            if (flCollision.top) {
                    this.brickCover.currentShadow = "crc-shadow-top";
                    this.brickCover.daAddClass(this.brickCover.currentShadow);
                };
            if (flCollision.left) {
                this.brickCover.currentShadow = "crc-shadow-left";
                this.brickCover.daAddClass(this.brickCover.currentShadow);
            };
            if (flCollision.right) {
                this.brickCover.currentShadow = "crc-shadow-right";
                this.brickCover.daAddClass(this.brickCover.currentShadow);
            };
            if (flCollision.bottom) {
                this.brickCover.currentShadow = "crc-shadow-bottom";
                this.brickCover.daAddClass(this.brickCover.currentShadow);
            };
            
            const flNewCoords = this.ball.daMoveStyle(this.ball.vectorSpeed, this.ball.vectorAngle, true, true );

            this.ballCurrentCoords = flNewCoords;
            
            this.iterate();

         });
    };
    

   
};


window.onload = () => {

    const flCollisionDemo = new DaSQCollision();
    document.body.append(flCollisionDemo.daMainTag);

};








