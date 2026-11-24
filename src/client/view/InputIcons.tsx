export function IconMouseLeft() {
    return (
        <svg viewBox="0 0 12 16" width={12} height={16}>
            <path stroke="currentcolor" fill="none"
                d="M 6.5 0.5 l 1 0 s 4 0, 4 4 l 0 7 s 0 4, -4 4 l -3 0 s -4 0, -4 -4 l 0 -2" />
            <path stroke="currentcolor" fill="currentcolor"
                d="M 0.5 8 l 0 -4 s 0 -4, 4 -4 l 0 0 l 0 8 z" />
        </svg>
    )
}
export function IconMouseLeftDrag() {
    return (
        <svg viewBox="0 0 16 16" width={16} height={16}>
            <path stroke="currentcolor" fill="none"
                d="M 6.5 0.5 l 1 0 s 4 0, 4 4 l 0 7 s 0 4, -4 4 l -3 0 s -4 0, -4 -4 l 0 -2" />
            <path stroke="currentcolor" fill="currentcolor"
                d="M 0.5 8 l 0 -4 s 0 -4, 4 -4 l 0 0 l 0 8 z" />
            <path stroke="currentcolor" stroke-linecap="round" fill="none"
                d="M 11.5 0.5 s 2 0, 2 4 l 0 5" />
            <path stroke="currentcolor" stroke-linecap="round" fill="none"
                d="M 15.5 2.5 l 0 4 " />
        </svg>
    )
}
export function IconMouseMiddle() {
    return (
        <svg viewBox="0 0 12 16" width={12} height={16}>
            <rect x={0.5} y={0.5} width={11} height={15} stroke="currentcolor" fill="none" rx={4} ry={4} />
            <rect x={4.5} y={2.5} width={3} height={6} stroke="currentcolor" fill="currentcolor" rx={2} ry={2} />
        </svg>
    )
}
export function IconMouseRight() {
    return (
        <svg viewBox="0 0 12 16" width={12} height={16}>
            <path stroke="currentcolor" fill="none"
                d="M 5.5 0.5 l -1 0 s -4 0, -4 4 l 0 7 s 0 4, 4 4 l 3 0 s 4 0, 4 -4 l 0 -2" />
            <path stroke="currentcolor" fill="currentcolor"
                d="M 11.5 8 l 0 -4 s 0 -4, -4 -4 l 0 0 l 0 8 z" />
        </svg>
    )
}
export function IconKey(props: { label: string }) {
    return (
        <svg viewBox="0 0 16 16" width={16} height={16}>
            <rect x={0.5} y={0.5} width={15} height={15} stroke="currentcolor" fill="none" rx={4} ry={4} />
            <text fill="currentcolor" x={8} y={8} text-anchor="middle" dominant-baseline="central">{props.label}</text>
        </svg>
    )
}
export function IconShift() {
    return (
        <svg viewBox="0 0 16 16" width={16} height={16}>
            <path stroke="currentcolor" fill="none" d="M 1.5 8.5 l 7 -7 l 7 7 l -4 0 l 0 7 l -6 0 l 0 -7 z" />
        </svg>
    )
}
export function IconOption() {
    return (
        <svg viewBox="0 0 16 16" width={16} height={16}>
            <rect x={0.5} y={0.5} width={15} height={15} stroke="currentcolor" fill="none" rx={4} ry={4} />
            <path stroke="currentcolor" fill="none" d="M 3.5 6.5 l 3 0 l 2 4 l 4 0 M 9.5 6.5 l 3 0" />
        </svg>
    )
}