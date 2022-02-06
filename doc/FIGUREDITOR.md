
# FigureEditor Architecture

The figure editor attempts to provide the framework for full featured 2d
vector graphic applications like Inkscape, CorelDraw or Adobe Illustrator
as well as simpler use cases like file folders.

Center is the FigureEditor class which can be extended by a number of tools.
Here is list of the basic tools along with their names in other applications:

| Tool    | Illustrator      | CorelDraw | Inkscape              | Description                        |
|---------|------------------|-----------|-----------------------|------------------------------------|
| Arrange | Selection        | Pick      | Select                | Move, Rotate, Scale, Group, ...    |
| Edit    | Direct Selection | Shape     | Control Point Editing | Edit points in figures.            |
| Pen     | Pen              | Pen       | Bezier Path           | Curves drawn one segment at a time. |
| Nib     | Paintbrush       | Artistic  | Pencil, Calligraphic  | Freehand curves considering pen pressure, rotation, tilt, ... |

  To support algorithms like fill, boolean operations, arrows which end at
the outline of a figure, deformation of images, figures do not directly
draw themselves.

  Figures export a path (lines & curves), which can then be
* used or
* manipulated by

algorithms.

  To provide a means for image manipulation, the manipulated paths then
also need to be made available to the figures again. Ie. a image will
export it's path, it get's deformed, the image figure then uses the path
to render the image within the deformed path.
(At least, that's the plan.)

```
class Figure {
  long id
  getPath(): Path
  updatePath()

  transform(Matrix)
  setHandlePosition(id, Point)
}

class AttributedFigure: Figure {
  stroke, strokeWidth, fill
}

class Shape: AttributedFigure {
  transform(Matrix): boolean
    changes origin & point, no shear, no rotate
    calls updatePath in subclass (don't?)
}

class Rectangle: Shape {
  getPath():
    creates the path if it does not exist
  updatePath():
    if it has a path, rebuilds it, calls Path.updateSVG()
}

class Group: Figure {
  pathGroup
  childFigures
}

class Transform: Group {
  transform():
    prepend Matrix
    call pathGroup transform & updateSVG: don't!
}

// for Path & PathGroup to have a common type
class AbstractPath {
}

// the path to do calculations with
class Path: AbstractPath {
  updateSVG()
    copies the path data to the SVG element
}

// the path to be rendered, and grouped into PathGroup to hold complete images
class AttributedPath: Path {
  stroke, strokeWidth, fill
}

class PathGroup: AbstractPath {
  data: Array<AbstractPath>
  matrix?: matrix // sure?
}
```

## IDEA

* to simplify the implementation of figures, they should only hold
  the data needed to describe them.
* hence Figure.getPath() will always create a new path
* the figure editor is responsible to cache these paths
* Transform.getPath() will apply it's matrix to the path
  this way we can append rotate and preprend scale to the transform
  matrix
* this means changing a figure will not update the SVG because it does
  not know about it. that's the figure editor's job too.

## IMPLEMENTATION STRATEGY
* spike this idea in a little test
* add caching later (if we need it at all)

What happens at mouseUp at the end of rotating a figure:
```
SelectionTool.stopHandle()
FigureEditor.transformSelection()
MyLayerModel.transform()

  figure.transform()

  or

  insert Transform
  call this.modified()
```
