import { Point, pointMinusPoint, pointMultiplyNumber, dot, squaredLength } from "../geometry"

// NOTE: try to use the one from toad2/fischland/fpath.cc and change it to take a minimum distance at which to abort?

/*
Solving the Nearest Point-on-Curve Problem 
and
A Bezier Curve-Based Root-Finder
by Philip J. Schneider
from "Graphics Gems", Academic Press, 1990
*/

// this is the version from
// https://github.com/erich666/GraphicsGems/blob/master/gems/NearestPoint.c

/*	point_on_curve.c	*/

const MAXDEPTH = 64         /*  Maximum depth for recursion */

function ldexp(mantissa: number, exponent: number) {
    var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
    var result = mantissa;
    for (var i = 0; i < steps; i++)
        result *= Math.pow(2, Math.floor((exponent + i) / steps));
    return result;
}

//  #define	EPSILON	(ldexp(1.0,-MAXDEPTH-1)) /*Flatness control value */
const EPSILON = ldexp(1.0, -MAXDEPTH-1)
const DEGREE = 3           /*  Cubic Bezier curve		*/
const W_DEGREE = 5         /*  Degree of eqn to find roots of */

/*
 *  NearestPointOnCurve :
 *  	Compute the parameter value of the point on a Bezier
 *		curve segment closest to some arbtitrary, user-input point.
 *		Return the point on the curve at that parameter value.
 *
 */
export function nearestPointOnCurve(P: Point, V: Point[])
//  Point2 	P;			/* The user-supplied point	  */
//  Point2 	*V;			/* Control points of cubic Bezier */
{
    // Point2 * w			/* Ctl pts for 5th-degree eqn	*/
    //  double 	t_candidate[W_DEGREE]	/* Possible roots		*/     
    const t_candidate = new Array<number>(W_DEGREE)
    //  int 	n_solutions		/* Number of roots found	*/
    //  double	t			/* Parameter value of closest pt*/

    /*  Convert problem to 5th-degree Bezier form	*/
    const w = ConvertToBezierForm(P, V)

    /* Find all possible roots of 5th-degree equation */
    const n_solutions = FindRoots(w, W_DEGREE, t_candidate, 0)
    // free((char *)w)

    /* Compare distances of P to all candidates, and to t=0, and t=1 */

    //  double 	dist, new_dist;
    //  Point2 	p;
    //  Vector2  v;
    //  int		i
    let dist, new_dist

    /* Check distance to beginning of curve, where t = 0	*/
    // const dist = V2SquaredLength(V2Sub(& P, & V[0], & v))
    dist = squaredLength(pointMinusPoint(P, V[0]))
    let t = 0.0

    /* Find distances for candidate points	*/
    for (let i = 0; i < n_solutions; i++) {
        const p = Bezier(V, DEGREE, t_candidate[i])
        new_dist = squaredLength(pointMinusPoint(P, p))
        if (new_dist < dist) {
            dist = new_dist
            t = t_candidate[i]
        }
    }

    /* Finally, look at distance to end point, where t = 1.0 */
    // new_dist = V2SquaredLength(V2Sub(& P, & V[DEGREE], & v))
    new_dist = squaredLength(pointMinusPoint(P, V[DEGREE]))
    if (new_dist < dist) {
        dist = new_dist
        t = 1.0
    }

    /*  Return the point on the curve at parameter value t */
    // printf("t : %4.12f\n", t)
    return Bezier(V, DEGREE, t)
}

/*
 *  ConvertToBezierForm :
 *		Given a point and a Bezier curve, generate a 5th-degree
 *		Bezier-format equation whose solution finds the point on the
 *      curve nearest the user-defined point.
 */
function ConvertToBezierForm(P: Point, V: Point[]): Point[]
//  Point2 	P;			/* The point to find t for	*/
//  Point2 	*V;			/* The control points		*/
{
    //  int 	i, j, k, m, n, ub, lb;	
    //  int 	row, column;		/* Table indices		*/
    const c = Array<Point>(DEGREE + 1)		/* V(i)'s - P			*/
    const d = Array<Point>(DEGREE)		/* V(i+1) - V(i)		*/
    // let w: Point			/* Ctl pts of 5th-degree curve  */
    //  double 	cdTable[3][4];		/* Dot product of c, d		*/
    const cdTable = Array(3).fill(null).map(() => Array<number>(4))
    const z = [	/* Precomputed "z" for cubics	*/
        [1.0, 0.6, 0.3, 0.1],
        [0.4, 0.6, 0.6, 0.4],
        [0.1, 0.3, 0.6, 1.0],
    ]

    /*Determine the c's -- these are vectors created by subtracting*/
    /* point P from each of the control points				*/
    for (let i = 0; i <= DEGREE; i++) {
        // V2Sub(& V[i], & P, & c[i])
        c[i] = pointMinusPoint(V[i], P)
    }
    /* Determine the d's -- these are vectors created by subtracting*/
    /* each control point from the next					*/
    for (let i = 0; i <= DEGREE - 1; i++) {
        // d[i] = V2ScaleII(V2Sub(& V[i + 1], & V[i], & d[i]), 3.0)
        d[i] = pointMultiplyNumber(pointMinusPoint(V[i + 1], V[i]), 3.0)
    }

    /* Create the c,d table -- this is a table of dot products of the */
    /* c's and d's							*/
    for (let row = 0; row <= DEGREE - 1; row++) {
        for (let column = 0; column <= DEGREE; column++) {
            // cdTable[row][column] = V2Dot(& d[row], & c[column])
            cdTable[row][column] = dot(d[row], c[column])
        }
    }

    /* Now, apply the z's to the dot products, on the skew diagonal*/
    /* Also, set up the x-values, making these "points"		*/
    // w = (Point2 *)malloc((unsigned)(W_DEGREE + 1) * sizeof(Point2))
    const w = Array<Point>(W_DEGREE + 1)
    for (let i = 0; i <= W_DEGREE; i++) {
        w[i] = { x: 0.0, y: i / W_DEGREE }
    }

    const n = DEGREE
    const m = DEGREE - 1
    for (let k = 0; k <= n + m; k++) {
        const lb = Math.max(0, k - m)
        const ub = Math.min(k, n)
        for (let i = lb; i <= ub; i++) {
            const j = k - i
            w[i + j].y += cdTable[j][i] * z[j][i]
        }
    }

    return w
}

/*
 *  FindRoots :
 *	Given a 5th-degree equation in Bernstein-Bezier form, find
 *	all of the roots in the interval [0, 1].  Return the number
 *	of roots found.
 */
function FindRoots(w: Point[], degree: number, t: number[], depth: number): number
// Point2 * w			/* The control points		*/
//      int 	degree		/* The degree of the polynomial	*/
// double * t			/* RETURN candidate t-values	*/
//      int 	depth		/* The depth of the recursion	*/
{
    //  int 	i;
    //  Point2 	Left[W_DEGREE + 1],	/* New left and right 		*/
    //     Right[W_DEGREE + 1]	/* control polygons		*/
    const Left = new Array<Point>(W_DEGREE+1)
    const Right = new Array<Point>(W_DEGREE+1)

    //  int 	left_count,		/* Solution count from		*/
    //     right_count		/* children			*/
    //  double 	left_t[W_DEGREE + 1],	/* Solutions from kids		*/
    //     right_t[W_DEGREE + 1]
    const left_t = Array<number>(W_DEGREE+1)
    const right_t = Array<number>(W_DEGREE+1)

    switch (CrossingCount(w, degree)) {
        case 0: {	/* No solutions here	*/
            return 0
        }
        case 1: {	/* Unique solution	*/
            /* Stop recursion when the tree is deep enough	*/
            /* if deep enough, return 1 solution at midpoint 	*/
            if (depth >= MAXDEPTH) {
                t[0] = (w[0].x + w[W_DEGREE].x) / 2.0
                return 1
            }
            if (ControlPolygonFlatEnough(w, degree)) {
                t[0] = ComputeXIntercept(w, degree)
                return 1
            }
            break
        }
    }

    /* Otherwise, solve recursively after	*/
    /* subdividing control polygon		*/
    Bezier(w, degree, 0.5, Left, Right)
    let left_count = FindRoots(Left, degree, left_t, depth + 1)
    let right_count = FindRoots(Right, degree, right_t, depth + 1)


    /* Gather solutions together	*/
    for (let i = 0; i < left_count; i++) {
        t[i] = left_t[i]
    }
    for (let i = 0; i < right_count; i++) {
        t[i + left_count] = right_t[i]
    }

    /* Send back total number of solutions	*/
    return (left_count + right_count)
}

/*
 * CrossingCount :
 *	Count the number of times a Bezier control polygon 
 *	crosses the 0-axis. This number is >= the number of roots.
 *
 */
function CrossingCount(V: Point[], degree: number)
// Point2 * V			/*  Control pts of Bezier curve	*/
//      int		degree			/*  Degreee of Bezier curve 	*/
{
    //  int 	i;	
    let n_crossings = 0	/*  Number of zero-crossings	*/
    let sign, old_sign		/*  Sign of coefficients	*/

    sign = old_sign = Math.sign(V[0].y)
    for (let i = 1; i <= degree; i++) {
        sign = Math.sign(V[i].y)
        if (sign != old_sign) n_crossings++
        old_sign = sign
    }
    return n_crossings
}

/*
 *  ControlPolygonFlatEnough :
 *	Check if the control polygon of a Bezier curve is flat enough
 *	for recursive subdivision to bottom out.
 *
 *  Corrections by James Walker, jw@jwwalker.com, as follows:
 
There seem to be errors in the ControlPolygonFlatEnough function in the
Graphics Gems book and the repository (NearestPoint.c). This function
is briefly described on p. 413 of the text, and appears on pages 793-794.
I see two main problems with it.
 
The idea is to find an upper bound for the error of approximating the x
intercept of the Bezier curve by the x intercept of the line through the
first and last control points. It is claimed on p. 413 that this error is
bounded by half of the difference between the intercepts of the bounding
box. I don't see why that should be true. The line joining the first and
last control points can be on one side of the bounding box, and the actual
curve can be near the opposite side, so the bound should be the difference
of the bounding box intercepts, not half of it.
 
Second, we come to the implementation. The values distance[i] computed in
the first loop are not actual distances, but squares of distances. I
realize that minimizing or maximizing the squares is equivalent to
minimizing or maximizing the distances.  But when the code claims that
one of the sides of the bounding box has equation
a * x + b * y + c + max_distance_above, where max_distance_above is one of
those squared distances, that makes no sense to me.
 
I have appended my version of the function. If you apply my code to the
cubic Bezier curve used to test NearestPoint.c,
 
 static Point2 bezCurve[4] = {    /  A cubic Bezier curve    /
    { 0.0, 0.0 },
    { 1.0, 2.0 },
    { 3.0, 3.0 },
    { 4.0, 2.0 },
    };
 
my code computes left_intercept = -3.0 and right_intercept = 0.0, which you
can verify by sketching a graph. The original code computes
left_intercept = 0.0 and right_intercept = 0.9.
 
 */

/* static int ControlPolygonFlatEnough( const Point2* V, int degree ) */
function ControlPolygonFlatEnough(V: Point[], degree: number): number
// Point2 * V		/* Control points	*/
//      int 	degree		/* Degree of polynomial	*/
{
    //  int     i        /* Index variable        */
    //  double  value;
    let max_distance_above: number
    let max_distance_below: number
    //  double  error        /* Precision of root        */
    //  double  intercept_1,
    //     intercept_2,
    //     left_intercept,
    //     right_intercept;
    //  double  a, b, c    /* Coefficients of implicit    */
    //          /* eqn for line from V[0]-V[deg]*/
    //  double  det, dInv;
    //  double  a1, b1, c1, a2, b2, c2

    /* Derive the implicit equation for line connecting first and last control points */
    let a = V[0].y - V[degree].y
    let b = V[degree].x - V[0].x
    let c = V[0].x * V[degree].y - V[degree].x * V[0].y

    max_distance_above = max_distance_below = 0.0

    for (let i = 1; i < degree; i++) {
        let value = a * V[i].x + b * V[i].y + c

        if (value > max_distance_above) {
            max_distance_above = value
        }
        else if (value < max_distance_below) {
            max_distance_below = value
        }
    }

    /*  Implicit equation for zero line */
    let a1 = 0.0
    let b1 = 1.0
    let c1 = 0.0

    /*  Implicit equation for "above" line */
    let a2 = a
    let b2 = b
    let c2 = c - max_distance_above

    let det = a1 * b2 - a2 * b1
    let dInv = 1.0 / det

    let intercept_1 = (b1 * c2 - b2 * c1) * dInv

    /*  Implicit equation for "below" line */
    a2 = a
    b2 = b
    c2 = c - max_distance_below

    det = a1 * b2 - a2 * b1
    dInv = 1.0 / det

    let intercept_2 = (b1 * c2 - b2 * c1) * dInv

    /* Compute intercepts of bounding box    */
    let left_intercept = Math.min(intercept_1, intercept_2)
    let right_intercept = Math.max(intercept_1, intercept_2)

    let error = right_intercept - left_intercept

    return (error < EPSILON) ? 1 : 0
}


 /*
  *  ComputeXIntercept :
  *	Compute intersection of chord from first control point to last
  *  	with 0-axis.
  * 
  */
 /* NOTE: "T" and "Y" do not have to be computed, and there are many useless
  * operations in the following (e.g. "0.0 - 0.0").
  */
 function ComputeXIntercept(V: Point[], degree: number): number
// Point2 * V			/*  Control points	*/
    //  int		degree 		/*  Degree of curve	*/
{
    //  double	XLK, YLK, XNM, YNM, XMK, YMK;
    //  double	det, detInv;
    //  double	S;
    //  double	X

    let XLK = 1.0 - 0.0
    let YLK = 0.0 - 0.0
    let XNM = V[degree].x - V[0].x
    let YNM = V[degree].y - V[0].y
    let XMK = V[0].x - 0.0
    let YMK = V[0].y - 0.0

    let det = XNM * YLK - YNM * XLK
    let detInv = 1.0 / det

    let S = (XNM * YMK - YNM * XMK) * detInv
    /*  T = (XLK*YMK - YLK*XMK) * detInv; */

    let X = 0.0 + XLK * S
    /*  Y = 0.0 + YLK * S; */

    return X
}

/*
 *  Bezier : 
 *	Evaluate a Bezier curve at a particular parameter value
 *      Fill in control points for resulting sub-curves if "Left" and
 *	"Right" are non-null.
 * 
 */
function Bezier(V: Point[], degree: number, t: number, Left?: Point[], Right?: Point[]): Point
//      int 	degree		/* Degree of bezier curve	*/
// Point2 * V			/* Control pts			*/
//      double 	t			/* Parameter value		*/
// Point2 * Left		/* RETURN left half ctl pts	*/
// Point2 * Right		/* RETURN right half ctl pts	*/
{
    //  int 	i, j		/* Index variables	*/
    // let Vtemp = Array.from(Array(W_DEGREE + 1), () => new Array<Point>(W_DEGREE + 1))
    let Vtemp = Array(W_DEGREE + 1).fill(null).map(() => Array<Point>(W_DEGREE + 1))

    /* Copy control points	*/
    for (let j = 0; j <= degree; j++) {
        Vtemp[0][j] = V[j]
    }

    /* Triangle computation	*/
    for (let i = 1; i <= degree; i++) {
        for (let j = 0; j <= degree - i; j++) {
            Vtemp[i][j] = {
                x: (1.0 - t) * Vtemp[i - 1][j].x + t * Vtemp[i - 1][j + 1].x,
                y: (1.0 - t) * Vtemp[i - 1][j].y + t * Vtemp[i - 1][j + 1].y
            }
        }
    }

    if (Left !== undefined) {
        for (let j = 0; j <= degree; j++) {
            Left[j] = Vtemp[j][0]
        }
    }
    if (Right !== undefined) {
        for (let j = 0; j <= degree; j++) {
            Right[j] = Vtemp[degree - j][j]
        }
    }

    return (Vtemp[degree][0])
}
