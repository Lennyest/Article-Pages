
// Exports a loader div that displays if the show argument is true.

export default function Loader({ show }) {
    return show ? <div className="loader"></div> : null;
}