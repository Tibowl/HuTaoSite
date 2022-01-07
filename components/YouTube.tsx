export default function YouTube({ vidID, autoplay }: { vidID: string, autoplay?: true }) {
    return <div style={{
        position: "relative",
        paddingBottom: "56.25%" /* 16:9 */,
        paddingTop: 25,
        height: 0
    }}>
        <iframe
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
            }}
            src={`https://www.youtube.com/embed/${vidID}${autoplay ? "?autoplay=1" : ""}`}
            frameBorder="0"
        />
    </div>
}
