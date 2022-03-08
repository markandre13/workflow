export function parseColor(color: string) {
    color = color.trim()
    if (color === "none") {
        return undefined
    }
    if (color[0] === '#') {
        if (color.length === 4) {
            const rgba = {
                r: parseInt(color[1], 16),
                g: parseInt(color[2], 16),
                b: parseInt(color[3], 16),
                a: 255
            }
            rgba.r = rgba.r | rgba.r << 4
            rgba.g = rgba.g | rgba.g << 4
            rgba.b = rgba.b | rgba.b << 4
            return rgba
        } else
        if (color.length === 7) {
            return {
                r: parseInt(color.substring(1,3), 16),
                g: parseInt(color.substring(3,5), 16),
                b: parseInt(color.substring(5,7), 16),
                a: 255
            }
        }
    } else
    if (color.startsWith("rgb(")) {
        const p = color.substring(4, color.length-1).split(',')
        if (p.length === 3) {
            if (p[0].endsWith("%")) {
                return {
                    r: Math.trunc(parseFloat(p[0].substring(0, p[0].length-1)) * 255 / 100),
                    g: Math.trunc(parseFloat(p[1].substring(0, p[1].length-1)) * 255 / 100),
                    b: Math.trunc(parseFloat(p[2].substring(0, p[2].length-1)) * 255 / 100),
                    a: 255
                }
            } else {
                return {
                    r: parseInt(p[0], 10),
                    g: parseInt(p[1], 10),
                    b: parseInt(p[2], 10),
                    a: 255
                }
            }
        }
    } else
    if (color.startsWith("rgba(")) {
        const p = color.substring(5, color.length-1).split(',')
        if (p.length === 4) {
            if (p[0].endsWith("%")) {
                return {
                    r: Math.trunc(parseFloat(p[0].substring(0, p[0].length-1)) * 255 / 100),
                    g: Math.trunc(parseFloat(p[1].substring(0, p[1].length-1)) * 255 / 100),
                    b: Math.trunc(parseFloat(p[2].substring(0, p[2].length-1)) * 255 / 100),
                    a: Math.trunc(parseFloat(p[3]) * 255)
                }
            } else {
                return {
                    r: parseInt(p[0], 10),
                    g: parseInt(p[1], 10),
                    b: parseInt(p[2], 10),
                    a: Math.trunc(parseFloat(p[3]) * 255)
                }
            }
        }
    }
    throw Error(`parseColor('${color}'): failed to parse`)
}
