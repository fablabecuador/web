const labs = [
  { name: "UIDESERV.LAB", slug: "fablabUIDE", city: "Quito", province: "Pichincha", lat: -0.246238, lng: -78.473944, status: "registered" },
  { name: "1Bacteria Fab Lab", slug: "BacteriaLab", city: "Quito", province: "Pichincha", lat: -0.207683, lng: -78.492019, status: "registered" },
  { name: "Fab Lab Ecuador", slug: "fablabecuador", city: "Quito", province: "Pichincha", lat: -0.208041, lng: -78.491218, status: "registered" },
  { name: "FabLab La Metro", slug: "fablablametro", city: "Quito", province: "Pichincha", lat: -0.21298, lng: -78.484999, status: "active" },
  { name: "FabLab YachayTech", slug: "fablabyachay", city: "Urcuqui", province: "Imbabura", lat: 0.419666, lng: -78.189801, status: "active" },
  { name: "Fab Lab UPS", slug: "fablabups", city: "Quito", province: "Pichincha", lat: -0.156213, lng: -78.500883, status: "active" },
  { name: "Mountain Lab", slug: "mountainlab", city: "Quito", province: "Pichincha", lat: -0.167988, lng: -78.479926, status: "planned" },
  { name: "AsiriLabs", slug: "asiri", city: "Guayaquil", province: "Guayas", lat: -2.146668, lng: -79.966069, status: "active" },
  { name: "DROT LAB", slug: "DROTLAB", city: "Cuenca", province: "Azuay", lat: -2.896336, lng: -78.995363, status: "planned" },
  { name: "FAB LAB UNIVERSIDAD CATOLICA DE CUENCA", slug: "fablabucacue", city: "Cuenca", province: "Azuay", lat: -2.885427, lng: -79.005825, status: "planned" },
  { name: "ESPOCH-FAB-LAB", slug: "espochfablab", city: "Riobamba", province: "Chimborazo", lat: -1.665023, lng: -78.658879, status: "active" },
  { name: "FabLab UDLA", slug: "fablabudla", city: "Quito", province: "Pichincha", lat: -0.167262, lng: -78.472632, status: "active" },
  { name: "CIDIIE", slug: "cidiie", city: "Quito", province: "Pichincha", lat: -0.198165, lng: -78.504408, status: "active" },
  { name: "D-Lab USFQ", slug: "usfqdlab", city: "Quito", province: "Pichincha", lat: -0.195146, lng: -78.43602, status: "active" },
  { name: "FabLab Indoam\u00e9rica", slug: "fablabindoamrica", city: "Ambato", province: "Tungurahua", lat: -1.27435, lng: -78.652063, status: "active" },
  { name: "FABLAB UTM", slug: "fablabutm", city: "Portoviejo", province: "Manab\u00ed", lat: -1.05446, lng: -80.451601, status: "active" },
  { name: "FabLab UPEC", slug: "fablabupec", city: "Tulc\u00e1n", province: "Carchi", lat: 0.805621, lng: -77.733869, status: "active" },
  { name: "Fablab EPN", slug: "fablabepn", city: "Quito", province: "Pichincha", lat: -0.210311, lng: -78.488997, status: "active" },
  { name: "Industrial FABLab UCUENCA", slug: "ucuenca", city: "Cuenca", province: "Azuay", lat: -2.902334, lng: -79.005153, status: "active" }
];

const statusLabels = {
  active: "Activo",
  planned: "Planificado",
  registered: "Registrado"
};

const mapElement = document.getElementById("labs-map");
const listElement = document.getElementById("labs-list");
const countElement = document.getElementById("labs-count");
const filterButtons = document.querySelectorAll(".map-filter");

if (mapElement && window.L) {
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
    const marker = L.marker([lab.lat, lab.lng], { icon: markerIcon(lab.status) })
      .bindPopup(`
        <strong>${lab.name}</strong>
        <span>${lab.city}, ${lab.province}</span>
        <em>${statusLabels[lab.status]}</em>
        <a href="https://www.fablabs.io/labs/${lab.slug}" target="_blank" rel="noopener noreferrer">Ver en FabLabs.io</a>
      `);

    markers.set(lab.slug, marker);
    bounds.extend([lab.lat, lab.lng]);
  });

  map.fitBounds(bounds, { padding: [26, 26] });

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

    const visibleBounds = L.latLngBounds(visibleLabs.map((lab) => [lab.lat, lab.lng]));
    if (visibleLabs.length) {
      map.fitBounds(visibleBounds, { padding: [26, 26] });
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

    map.setView([lab.lat, lab.lng], 13);
    marker.openPopup();
  });

  renderLabs();
}
