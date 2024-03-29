## Goal

Workflow is intended for everything related to 2d vector graphics.

The target is users as well as artists/software developers who want to tweak and extend their tools and have the source code as well as the created artwork available in an open non-proprietary format.

The name _Workflow_ was choosen to indicate a tool which can be adjusted to the user's workflow.

## Vector Graphics (In Development)

Providing decent vector graphics support 

* basic shapes like rectangle, circle, ...
* text
* bezier paths
* freehand
* boolean operations
* flood fill
* bitmap images
* transformations (perspective, etc.)

Note: Last time I looked at Inkscape, their algorithms leave something to wish for, eg.
* Inkscape's flood fill converts the image to a bitmap, fills that and converts the result back to a vector graphic. the result depends on the current zoom level.
* Inkscape's ink tool doesn't use all the pen's data (pressure, rotation) to emulate the nib.

## Manga/Comic (Planned)

I've been a user of Manga Studio/Cell Studio Paint and one of the biggest drawbacks for me was it's inability to export vector graphics. Hence the plan is to support the following features in Workflow:

* Screentones
* Panels
* Rulers
* Speech Bubbles
* Pages
* Page Templates

## Software Development (Planned)

I'm a software developer and most of the time the diagrams I draw are done as ASCII art because it is easy to create and share.

Hence the plan is to add support for various UML Diagrams

## Collaborative Real-Time (Planned)

The code currently contains a limited proof of concept. For a production ready implementation WebRTC and CRDTs will be required.

## Scrum/Kanban Board (Planned)

This is the idea which got Workflow started in the first place:

Managing the software development process through Lean/Agile methodologies
means to apply the same steps used in creating an algorithm to the software
development process itself:

    • design the algorithm (Plan)
    • implement the algorithm (Do)
    • test the algorithm (Check/Study)
    • release the algorithm (Act/Adjust)

A tool to visualize the software development process and to give the team
ownership of it's process, is the Kanban board as described in Henrik
Kniberg's seminal book <a
href="https://www.crisp.se/file-uploads/Lean-from-the-trenches.pdf">Lean
from the Trenches</a>.

When compared to what Kniberg did for the Swedish police, electronic kanban
boards, like Jira, et al., place a lot of restrictions on what can be done to
the board.

Some restrictions are owed to the hardware

 * limited screen space
 * single user interface (one mouse & one keyboard)
 * no haptic experience
 * restricted face to face communication between developers

But some might be overcome by large, high-resolution touch screens and/or by
turning each developers phone/tablet into a input device.

Other restrictions are owed to the software and the organizations which run
them:

 * kanban board with only columns and lanes
 * no notes, descriptions, drawings, etc. on the kanban board
 * no undo/redo
 * no collaborative real-time interaction
 * screen sharing makes it annoying to switch temporarily to another application
 * sometimes all changes to the board structure have to go through an
   unwilling administrator
 * sometimes management doesn't want everything to be put on the board
   because it might look bad to outsiders
 * no API to use custom algorithms to analyse the data
 * separate Wiki which lacks decent support for flowcharts, UML diagrams, ...
 * separate Chat (ie. Workflow could highlight/enlarge/animate the cursor of the person speaking)
 * separate Chatroom and likely not threaded like Reddit or imporant comments not markable as sticky
 * not suited for sophisticated illustrations
 * not open source, so you can not extend/change/fix it
 * etc.

 Then there are also restrictions with physical boards:
 * no anonymous dot voting
 * can only be archived by taking a photo
 * etc.

Workflow aims to be a Kanban board which is not less but more than a building
plastered with whiteboards.

