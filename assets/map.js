const statusLabels = {
  active: "Activo",
  planned: "Planificado",
  registered: "Registrado"
};

const mapElement = document.getElementById("labs-map");
const listElement = document.getElementById("labs-list");
const countElement = document.getElementById("labs-count");
const filterButtons = document.querySelectorAll(".map-filter");

const loadLabs = async () => {
  const response = await fetch("assets/labs.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de laboratorios.");
  }

  return response.json();
};

const isVisibleLab = (lab) => lab.visible !== false && Number.isFinite(lab.lat) && Number.isFinite(lab.lng);

const labLocation = (lab) => [lab.lat, lab.lng];

const labUrl = (lab) => lab.url || `https://www.fablabs.io/labs/${lab.slug}`;

const labLinkLabel = (lab) => lab.linkLabel || (lab.url ? "Ver sede UPS" : "Ver en FabLabs.io");

const ecuadorBounds = L.latLngBounds([
  [-5.25, -81.4],
  [1.65, -75.05]
]);

const createMap = (labs) => {
  const map = L.map(mapElement, {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([-1.35, -78.7], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const markers = new Map();
  const bounds = L.latLngBounds();

  const markerIcon = (status) => L.divIcon({
    className: `lab-marker lab-marker-${status}`,
    html: "<span></span>",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  labs.forEach((lab) => {
    const marker = L.marker(labLocation(lab), { icon: markerIcon(lab.status) })
      .bindPopup(`
        <strong>${lab.name}</strong>
        <span>${lab.city}, ${lab.province}</span>
        <em>${statusLabels[lab.status]}</em>
        <a href="${labUrl(lab)}" target="_blank" rel="noopener noreferrer">${labLinkLabel(lab)}</a>
      `);

    markers.set(lab.slug, marker);
    bounds.extend(labLocation(lab));
  });

  map.fitBounds(ecuadorBounds, { padding: [18, 18] });

  const renderLabs = (filter = "all") => {
    const visibleLabs = labs.filter((lab) => filter === "all" || lab.status === filter);

    markers.forEach((marker) => marker.remove());
    visibleLabs.forEach((lab) => markers.get(lab.slug).addTo(map));

    countElement.textContent = visibleLabs.length;
    listElement.innerHTML = visibleLabs.map((lab) => `
      <button type="button" class="lab-item" data-slug="${lab.slug}">
        <span>
          <strong>${lab.name}</strong>
          <small>${lab.city}, ${lab.province}</small>
        </span>
        <em class="lab-status lab-status-${lab.status}">${statusLabels[lab.status]}</em>
      </button>
    `).join("");

    if (filter === "all") {
      map.fitBounds(ecuadorBounds, { padding: [18, 18] });
    } else if (visibleLabs.length) {
      map.fitBounds(L.latLngBounds(visibleLabs.map(labLocation)), { padding: [26, 26] });
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderLabs(button.dataset.filter);
    });
  });

  listElement.addEventListener("click", (event) => {
    const item = event.target.closest(".lab-item");
    if (!item) return;

    const lab = labs.find((entry) => entry.slug === item.dataset.slug);
    const marker = markers.get(item.dataset.slug);
    if (!lab || !marker) return;

    map.setView(labLocation(lab), 13);
    marker.openPopup();
  });

  renderLabs();
};

if (mapElement && window.L) {
  loadLabs()
    .then((labs) => createMap(labs.filter(isVisibleLab)))
    .catch(() => {
      mapElement.innerHTML = "<p class=\"map-error\">No se pudo cargar el mapa de laboratorios.</p>";
    });
}
