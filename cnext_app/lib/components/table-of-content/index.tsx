const TableOfContents = () => {
    return (
        <nav
            style={{
                position: "absolute",
                right: 0,
                zIndex: 100000000,
                width: 120,
                background: "white",
                boxShadow: "0px 10px 10px 1px #aaaaaa",
                height: "100%"
            }}
            aria-label="Table of contents"
        >
            Hello world!
        </nav>
    );
};

export default TableOfContents;
