State diagram of the pen tool:

```mermaid
---
config:
  look: classic
---
 stateDiagram-v2
    [*] --> READY
    READY --> DOWN_ADD_FIRST_ANCHOR: down
    state CreatePath {
        DOWN_ADD_FIRST_ANCHOR --> DOWN_DRAG_FIRST_ANCHOR: move beyond DRAG_START_DISTANCE
        DOWN_ADD_FIRST_ANCHOR --> ACTIVE: up
        DOWN_DRAG_FIRST_ANCHOR --> ACTIVE: up
    }

    state ContinuePath {
        ACTIVE --> DOWN_ADD_ANCHOR: down elsewhere
        DOWN_ADD_ANCHOR --> DOWN_DRAG_ANCHOR: move beyond DRAG_START_DISTANCE
        DOWN_ADD_ANCHOR --> ACTIVE: up
        DOWN_DRAG_ANCHOR --> ACTIVE: up
        DOWN_DRAG_ANCHOR --> DOWN_DRAG_EDGE: Alt down
        DOWN_DRAG_EDGE --> DOWN_DRAG_ANCHOR: Alt up
        DOWN_DRAG_EDGE --> ACTIVE: up
    }
    ACTIVE --> DOWN_CLOSE_EDGE: down on first anchor (ANCHOR_EDGE)
    ACTIVE --> DOWN_CLOSE_CURVE: down on first anchor (ANCHOR_EDGE_ANGLE)

    state ClosePath {
        DOWN_CLOSE_EDGE --> DRAG_CLOSE_EDGE: move beyond DRAG_START_DISTANCE
        DOWN_CLOSE_CURVE --> DRAG_CLOSE_CURVE: move beyond DRAG_START_DISTANCE
    }
    DOWN_CLOSE_EDGE --> READY: up
    DRAG_CLOSE_EDGE --> READY: up
    DOWN_CLOSE_CURVE --> READY: up
    DRAG_CLOSE_CURVE --> READY: up
```

terminology:
* paths are [composite bézier curves](https://en.wikipedia.org/wiki/Composite_Bézier_curve)
* acceleration continuity:
* tangent continuity: 
* anchor point / knot / control point
* drag: pointer down, move, pointer up

create new path
* click: add anchor point without tangent
* drag: add anchor point with tangent

continue path (this should already draw a line)
* click: add anchor point without tangent
* drag: add anchor point with tangents
* opt/alt key: adjust forward tangents

special keys
* TODO esc / return: finish so a new path can be created
* TODO: backspace: remove last curve / line
* TODO shift: restrict to 45 degree angles
* TODO: tab: connect to another object
