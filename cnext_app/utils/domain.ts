export function getDomain() {
    let hostname = window.location.hostname;
    if (hostname === "localhost") return "http://localhost";
    return `${window.location.protocol}//${hostname}`;
}
