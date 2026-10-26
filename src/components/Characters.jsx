import { useEffect, useMemo, useRef, useState } from "react";
import "./Characters.css";

const PAGE_SIZES = [6, 12, 24];

const STATUS = {
  Alive: { label: "Vivo", css: "alive" },
  Dead: { label: "Muerto", css: "dead" },
};
const STATUS_UNKNOWN = { label: "Desconocido", css: "unknown" };

// Ej.: [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 20]
function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items = [1];
  const start = Math.max(3, current - 1);
  const end = Math.min(total - 2, current + 1);

  if (start > 3) items.push("ellipsis-start");
  else items.push(2);

  for (let i = start; i <= end; i++) items.push(i);

  if (end < total - 2) items.push("ellipsis-end");
  else items.push(total - 1);

  items.push(total);
  return items;
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Paginación de personajes">
      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <span aria-hidden="true">‹</span>
        <span className="page-btn__text">Anterior</span>
      </button>

      <ul className="page-list">
        {getPageItems(page, totalPages).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                className="page-btn"
                onClick={() => onChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Ir a la página ${item}`}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="page-ellipsis" aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >
        <span className="page-btn__text">Siguiente</span>
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}

function CharacterCard({ character, index }) {
  const status = STATUS[character.status] ?? STATUS_UNKNOWN;

  const details = [
    ["Episodios", character.episode?.length ?? 0],
    ["Especie", character.species],
    ["Género", character.gender],
    ["Origen", character.origin?.name],
    ["Ubicación", character.location?.name],
  ];

  return (
    <article className="char-card" style={{ "--i": index }}>
      <div className="char-card__media">
        <img src={character.image} alt={character.name} loading="lazy" />
      </div>

      <div className="char-card__body">
        <h3 className="char-card__name">{character.name}</h3>
        <span className={`char-status char-status--${status.css}`}>
          {status.label}
        </span>

        <dl className="char-info">
          {details.map(([label, value]) => (
            <div className="char-info__row" key={label}>
              <dt>{label}</dt>
              <dd>{value || "Desconocido"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

export default function Characters(props) {
  const { characters, setCharacters } = props;

  const topRef = useRef(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  // Descarta valores null/undefined que pudieran venir en el arreglo
  const list = useMemo(
    () => (Array.isArray(characters) ? characters.filter(Boolean) : []),
    [characters],
  );

  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visible = list.slice(startIndex, startIndex + pageSize);

  // Si llega una nueva búsqueda, vuelve a la primera página
  useEffect(() => {
    setPage(1);
  }, [characters]);

  const goToPage = (n) => {
    setPage(Math.min(Math.max(n, 1), totalPages));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageSize = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const resetCharacters = () => {
    setCharacters(null);
  };

  return (
    <section className="chars-page">
      <header className="chars-header" ref={topRef}>
        <h1 className="chars-title">Personajes</h1>
        <button type="button" className="chars-back" onClick={resetCharacters}>
          ← Volver al Home
        </button>
      </header>

      {list.length === 0 ? (
        <p className="chars-empty">No hay personajes para mostrar.</p>
      ) : (
        <>
          <div className="chars-toolbar">
            <p className="chars-count">
              Mostrando{" "}
              <strong>
                {startIndex + 1}–{startIndex + visible.length}
              </strong>{" "}
              de <strong>{list.length}</strong> personajes
            </p>

            <label className="chars-pagesize">
              Por página
              <select value={pageSize} onChange={handlePageSize}>
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* key={currentPage} reinicia la animación de entrada al cambiar de página */}
          <div className="char-grid" key={currentPage}>
            {visible.map((character, i) => (
              <CharacterCard
                key={character.id ?? startIndex + i}
                character={character}
                index={i}
              />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={goToPage}
          />
        </>
      )}

      <footer className="chars-footer">
        <button
          type="button"
          className="chars-back"
          onClick={resetCharacters}
        >
          Volver al Home para buscar más personajes
        </button>
      </footer>
    </section>
  );
}