export function screenSync() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            resolve("success")
        })
    })
}
