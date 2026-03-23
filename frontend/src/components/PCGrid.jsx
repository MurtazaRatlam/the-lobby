import PCCard from "./PCCard";

const RoomSection = ({ title, rows, onCardClick, tick }) => (
  <section className="app-surface rounded-2xl p-5">
    <h3 className="mb-4 text-lg font-semibold">{title}</h3>
    {rows.map((row, idx) => (
      <div className="mb-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" key={`${title}-${idx}`}>
        {row.map((pc) => (
          <PCCard key={pc.id} pc={pc} onClick={() => onCardClick(pc)} tick={tick} />
        ))}
      </div>
    ))}
  </section>
);

const PCGrid = ({ pcs, onCardClick, tick }) => {
  const leftRoom = pcs.filter((pc) => pc.room === "left");
  const rightTop = pcs.filter((pc) => pc.room === "right" && pc.position === "top");
  const rightBottom = pcs.filter((pc) => pc.room === "right" && pc.position === "bottom");

  return (
    <div className="space-y-5">
      <RoomSection title="Lobby" rows={[leftRoom]} onCardClick={onCardClick} tick={tick} />
      <RoomSection
        title="Main"
        rows={[rightTop, rightBottom]}
        onCardClick={onCardClick}
        tick={tick}
      />
    </div>
  );
};

export default PCGrid;
