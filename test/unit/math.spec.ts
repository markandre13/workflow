// function testMath() {
//     // GIVEN RECTANGLE { origin: {x:50, y: 50}, size: {width: 20, height: 30}}
//     let test = new FigureEditorUser()
//     test.addRectangle()

//     // WHEN ROTATED
//     test.selectFigure()

//     let oldMouseRotate = test.centerOfNWRotateHandle()
//     let center = test.centerOfFigure()
//     let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/8)

//     console.log("=============================================== mouseDown")
//     test.mouseDownAt(oldMouseRotate)
//     console.log("=============================================== mouseMove")
//     test.moveMouseTo(newMouseRotate)
//     console.log("=============================================== mouseUp")
//     test.mouseUp()
// return
//     // THEN SELECT TOOL DECORATION IS ROTATED
//     test.selectionHasPoint({x: 56.77205421043658, y: 47.96825417111798})
//     test.selectionHasPoint({x: 75.24964486066233, y: 55.621922818419776})
//     test.selectionHasPoint({x: 63.76914188970962, y: 83.33830879375839})
//     test.selectionHasPoint({x: 45.29155123948388, y: 75.68464014645659})

//     // WHEN DESELECTED & RESELECTED
//     Tool.selection.clear()
//     try {
//         test.selectFigure()
//     }
//     catch(error) {
//         console.log("caught error")
//         console.log(error)
//     }

//     // THEN SELECT TOOL DECORATION IS STILL ROTATED
//     test.selectionHasPoint({x: 56.77205421043658, y: 47.96825417111798})
//     test.selectionHasPoint({x: 75.24964486066233, y: 55.621922818419776})
//     test.selectionHasPoint({x: 63.76914188970962, y: 83.33830879375839})
//     test.selectionHasPoint({x: 45.29155123948388, y: 75.68464014645659})

//     // WHEN SCALED
//     console.log(`================= scale =====================`)
//     let r = new Rectangle({origin:{x: 50, y:50}, size: {width: 20, height: 30}})
//     let c = r.center()
//     let m = new Matrix()
//     m.translate(pointMinus(c))
//     m.rotate(Math.PI/8)
//     m.translate(c)
//     let scaleDown = m.transformPoint({x: 50, y: 50})
//     let scaleUp = m.transformPoint({x: 60, y: 30})

//     console.log(`scaleDown: ${scaleDown.x}, ${scaleDown.y}`)
//     console.log(`scaleUp: ${scaleUp.x}, ${scaleUp.y}`)
    
//     test.mouseDownAt(scaleDown)
//     test.moveMouseTo(scaleUp)

//     // decoration is correct, outline not

//     // check that the decoration is correct before figure is transformed
//     // test.mouseUp()
//     // check that the decoration is correct after figure was transformed

//     test.selectionHasPoint({x: 56.77205421043658, y: 27.96825417111798})
//     test.selectionHasPoint({x: 63.76914188970962, y: 83.33830879375839})
// }

// function testMath2() {
//     document.body.innerHTML=`<svg id="svg" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ddd" width="640" height="480" viewBox="0 0 640 480"></svg>`    
//     let svg = document.getElementById("svg")!

//     // original rectangle
//     let r = new Rectangle({origin:{x: 50, y:50}, size: {width: 20, height: 30}})
//     let rectangle0 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
//     rectangle0.setAttributeNS("", "stroke", "#000")
//     rectangle0.setAttributeNS("", "fill", "#d88")
//     rectangle0.setAttributeNS("", "x", String(r.origin.x))
//     rectangle0.setAttributeNS("", "width", String(r.size.width))
//     rectangle0.setAttributeNS("", "y", String(r.origin.y))
//     rectangle0.setAttributeNS("", "height", String(r.size.height))
//     svg.appendChild(rectangle0)

//     let c = r.center()
//     let rotateMatrix = new Matrix()
//     rotateMatrix.translate(pointMinus(c))
//     rotateMatrix.rotate(Math.PI/8)
//     rotateMatrix.translate(c)

//     let rotatedRectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect")
//     rotatedRectangle.setAttributeNS("", "stroke", "#000")
//     rotatedRectangle.setAttributeNS("", "fill", "#88d")
//     rotatedRectangle.setAttributeNS("", "x", String(r.origin.x))
//     rotatedRectangle.setAttributeNS("", "width", String(r.size.width))
//     rotatedRectangle.setAttributeNS("", "y", String(r.origin.y))
//     rotatedRectangle.setAttributeNS("", "height", String(r.size.height))
//     rotatedRectangle.setAttributeNS("", "transform", `matrix(${rotateMatrix.a} ${rotateMatrix.b} ${rotateMatrix.c} ${rotateMatrix.d} ${rotateMatrix.e} ${rotateMatrix.f})`)
//     svg.appendChild(rotatedRectangle)

//     // INPUT: start and end point of scale
//     let [x0, y0] = rotateMatrix.transformArrayPoint([50, 50])
//     console.log(`  start scale on screen = (${x0}, ${y0})`)

//     let [x1, y1] = rotateMatrix.transformArrayPoint([60, 30])
//     console.log(`  end scale on screen = (${x1}, ${y1})`)

//     // GOAL
//     let w = new Rectangle({origin:{x: 60, y:30}, size: {width: 10, height: 50}})
//     let wantRectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect")
//     wantRectangle.setAttributeNS("", "stroke", "#000")
//     wantRectangle.setAttributeNS("", "fill", "#080")
//     wantRectangle.setAttributeNS("", "x", String(w.origin.x))
//     wantRectangle.setAttributeNS("", "width", String(w.size.width))
//     wantRectangle.setAttributeNS("", "y", String(w.origin.y))
//     wantRectangle.setAttributeNS("", "height", String(w.size.height))
//     wantRectangle.setAttributeNS("", "transform", `matrix(${rotateMatrix.a} ${rotateMatrix.b} ${rotateMatrix.c} ${rotateMatrix.d} ${rotateMatrix.e} ${rotateMatrix.f})`)
//     svg.appendChild(wantRectangle)

//     // CALCULATION
//     let inverseRotateMatrix = new Matrix(rotateMatrix)
//     inverseRotateMatrix.invert()

//     // let [x2, y2] = im.transformArrayPoint([x0, y0])
//     // console.log(`  start scale = (${x2}, ${y2})`)

//     // from screen to boundary coordinates
//     let [x3, y3] = inverseRotateMatrix.transformArrayPoint([x1, y1])
//     console.log(`  end scale = (${x3}, ${y3})`)

//     // old boundary
//     let [ox0, oy0] = [r.origin.x, r.origin.y]
//     let [ox1, oy1] = [r.origin.x+r.size.width, r.origin.y+r.size.height]

//     // new boundary
//     let [nx0, ny0] = [x3, y3] // x3, y3
//     let [nx1, ny1] = [r.origin.x+r.size.width, r.origin.y+r.size.height]

//     // scale from old to new boundary
//     let [sx, sy] = [(nx1-nx0)/(ox1-ox0), (ny1-ny0)/(oy1-oy0)]
//     console.log(`  translate(${-ox0}, ${-oy0})`)
//     console.log(`  scale(${sx}, ${sy})`)
//     console.log(`  translate(${nx0}, ${ny0})`)

//     // 4 multiplications
//     // let m2 = new Matrix()
//     // m2.translate({x: -ox0, y: -oy0})
//     // m2.scale(sx, sy)
//     // m2.translate({x: nx0, y: ny0})
//     // // combine scale with previous rotation
//     // m2.prepend(m)

//     // 3 multiplications
//     let scaleMatrix = new Matrix(rotateMatrix)
//     scaleMatrix.postTranslate({x: nx0, y: ny0})
//     scaleMatrix.postScale(sx, sy)
//     scaleMatrix.postTranslate({x: -ox0, y: -oy0})
    
//     // the green rectangle is the one we want
//     let gotRectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect")
//     gotRectangle.setAttributeNS("", "stroke", "#000")
//     gotRectangle.setAttributeNS("", "fill", "#0f0")
//     gotRectangle.setAttributeNS("", "x", String(r.origin.x))
//     gotRectangle.setAttributeNS("", "width", String(r.size.width))
//     gotRectangle.setAttributeNS("", "y", String(r.origin.y))
//     gotRectangle.setAttributeNS("", "height", String(r.size.height))
//     gotRectangle.setAttributeNS("", "transform", `matrix(${scaleMatrix.a} ${scaleMatrix.b} ${scaleMatrix.c} ${scaleMatrix.d} ${scaleMatrix.e} ${scaleMatrix.f})`)
//     svg.appendChild(gotRectangle)

//     // now simulate how scaling a path would work, using a red rectangle
//     let path = new Path()
//     path.appendRect(r)
//     path.transform(rotateMatrix)

//     let scaler = new Matrix()
   
//     scaler.append(inverseRotateMatrix)
//     scaler.translate({x: -ox0, y: -oy0})
//     scaler.scale(sx, sy)
//     scaler.translate({x: nx0, y: ny0})
//     scaler.prepend(rotateMatrix)

//     // scaler.translate({x: -ox0, y: -oy0})
//     // scaler.translate({x: nx0, y: ny0})

//     path.transform(scaler)
    
//     let svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path") 
//     svgPath.setPathData(path.data)
//     svg.setAttributeNS("", "stroke-width", "1")
//     svg.setAttributeNS("", "stroke", "#f00")
//     svg.setAttributeNS("", "fill", "none")
//     svg.appendChild(svgPath)
// }

// // try to tweak the 'render pipeline' of SelectTool, Transform, PathGroup, Path, Rectangle to create a correct outline
// function testMath3() {
//     document.body.innerHTML=`<svg id="svg" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ddd" width="640" height="480" viewBox="0 0 640 480"></svg>`    
//     let svg = document.getElementById("svg")!

//     // red: original rectangle
//     let rect0 = new figure.Rectangle({origin:{x: 50, y:50}, size: {width: 20, height: 30}})
//     rect0.stroke = "#800"
//     let path0 = rect0.getPath()
//     // path0.updateSVG()
//     // svg.appendChild(path0.svg)
   
//     // green: rotated rectangle
//     let r = new Rectangle({origin:{x: 50, y:50}, size: {width: 20, height: 30}})
//     let rect1 = new figure.Rectangle(r)
//     rect1.stroke = "#080"
//     let trans1 = new figure.Transform()
//     let c = r.center()
//     let m1 = new Matrix()
//     m1.translate(pointMinus(c))
//     m1.rotate(Math.PI/8)
//     m1.translate(c)
//     trans1.transform(m1)
//     trans1.add(rect1)
//     let path1 = trans1.getPath()
//     // path1.updateSVG()
//     // svg.appendChild(path1.svg)

//     // blue: rotated rectangle with scaleMatrix
//     let rect2 = new figure.Rectangle(r)
//     rect1.stroke = "#008"
//     let trans2 = new figure.Transform()
//     trans2.add(rect2)

//     let scaleMatrix = new Matrix()
//     scaleMatrix.translate({x: -50, y:-50})
//     scaleMatrix.scale(0.5, 1.6666666666666667)
//     scaleMatrix.translate({x: 60, y: 30.000000000000004})

//     let rotateMatrix = new Matrix()
//     rotateMatrix.translate(pointMinus(c))   
//     rotateMatrix.rotate(Math.PI/8)
//     rotateMatrix.translate(c)

//     // rotation is to be prepended
//     trans2.prependMatrix(rotateMatrix)

//     // scale is to be appended
//     trans2.appendMatrix(scaleMatrix)

//     trans2.prependMatrix(rotateMatrix)
    
//     let path2 = trans2.getPath()
//     // path2.updateSVG()
//     // svg.appendChild(path2.svg)
// }
