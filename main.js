import * as Surplus from "surplus";
import S from "s-js";
import router from "sig-router";
import data from "surplus-mixin-data";

const Root = () => {
  router.unknownRouteComponent(() => (
    <div>
      <strong>Oh no!</strong> That doesn&apos;t appear to be a real page!
    </div>
  ));

  router.add("/", () => {
    const rows = S.data();
    const columns = S.data();

    return (
      <div style={{ textAlign: "center" }}>
        <h1>Welcome to Surplus Memory Game!</h1>
        <div>
          Before beginning please specify the number of rows and columns
        </div>
        <input type="number" placeholder="Rows" fn={data(rows)} />
        <input type="number" placeholder="Columns" fn={data(columns)} />
        {rows() &&
          columns() && (
            <button
              onClick={() =>
                router.go(["start", "rows", rows(), "columns", columns()])
              }
            >
              Start
            </button>
          )}
      </div>
    );
  });

  router.add("/start/rows/:rows/columns/:columns", ({ rows, columns }) => {
    const board = new Array(columns * rows)
      .fill()
      .map((_, i) => S.data({value: Math.floor(i / 2)}))
      .sort(() => Math.random() - 0.5);

    let activeItems;

    S(() => {
      const isComplete = board.every(item => item().found);

      if (isComplete) {
        return alert("Congratulations you won!");
      }

      activeItems = board.filter(item => item().active);

      if (activeItems.length < 2) return;

      const isMatch = activeItems[0]().value === activeItems[1]().value;

      setTimeout(() => {
        S.freeze(() => {
          activeItems[0]({
            ...activeItems[0](),
            found: isMatch,
            active: false
          });

          activeItems[1]({
            ...activeItems[1](),
            found: isMatch,
            active: false
          });
        });
      }, 500);
    });

    return (
      <div
        style={{
          height: "100%",
          width: "50%",
          margin: "0 auto",
          display: "grid",
          "grid-template-columns": `repeat(${columns}, 1fr)`
        }}
      >
        {board.map((item, index) => {
          const { active, found, image, value } = item();
          const isFlipped = active || found;

          const setActive = () => {
            if (activeItems.length > 1) return;
            item({ ...item(), active: true });
          };

          return (
            <div
              onClick={setActive}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isFlipped ? "blue" : "red",
                boxSizing: "border-box",
                border: "1px solid"
              }}
            >
              {isFlipped ? value : "Click"}
            </div>
          );
        })}
      </div>
    );
  });

  return (
    <div style={{ height: "100%", width: "100%" }}>{router.component}</div>
  );
};

S.root(() => {
  const root = document.getElementById("content");

  if (!root) {
    console.error("no element called #content");
    return;
  }
  root.innerHTML = "";
  root.appendChild(Root());
});
