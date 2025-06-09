// ================== INITIALISATION ================== //
let map;
let markers = [];

// Initialise la carte au chargement
function initMap() {
    map = L.map('map').setView([48.8566, 2.3522], 5); // Europe par défaut

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

// ================== FONCTIONS CARTE ================== //
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function addMarker(place) {
    const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
            html: `<i class="fas fa-map-pin" style="color: #e74c3c; font-size: 24px;"></i>`,
            className: 'custom-marker'
        })
    }).addTo(map)
      .bindPopup(`
          <h3>${place.name}</h3>
          <p><i class="fas fa-city"></i> ${place.city}, ${place.country}</p>
          <p><i class="fas fa-tag"></i> ${place.category}</p>
      `);

    markers.push(marker);
    return marker;
}

// ================== RECHERCHE PRINCIPALE ================== //
async function search() {
    // Récupère les filtres (votre code existant)
    const params = new URLSearchParams({
        query: document.getElementById("query").value,
        location: document.getElementById("location").value,
        category: document.getElementById("category").value,
        price: document.getElementById("price").value
    });

    try {
        const response = await fetch(`https://votre-backend.onrender.com/search?${params}`);
        const data = await response.json();

        // Efface les anciens résultats
        clearMarkers();
        let html = "";

        if (data.results.length > 0) {
            const bounds = L.latLngBounds([]);

            // Traite chaque résultat
            data.results.forEach(place => {
                // Ajoute à la liste
                html += `
                    <div class="result-card"
                         onmouseenter="highlightMarker(${place.lat}, ${place.lng})">
                        <h3>${place.name}</h3>
                        <div class="badges">
                            <span class="badge"><i class="fas fa-map-marker-alt"></i> ${place.city}</span>
                            <span class="badge"><i class="fas fa-tag"></i> ${place.category}</span>
                        </div>
                        <p>${place.description}</p>
                    </div>
                `;

                // Ajoute le marqueur
                if (place.lat && place.lng) {
                    addMarker(place);
                    bounds.extend([place.lat, place.lng]);
                }
            });

            // Ajuste la vue de la carte
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        } else {
            html = `<div class="no-results">Aucun résultat trouvé</div>`;
        }

        document.getElementById("results").innerHTML = html;
    } catch (error) {
        console.error("Erreur:", error);
    }
}

// ================== FONCTIONS UTILITAIRES ================== //
function highlightMarker(lat, lng) {
    const marker = markers.find(m =>
        m.getLatLng().lat === lat &&
        m.getLatLng().lng === lng
    );
    if (marker) {
        marker.openPopup();
        map.setView(marker.getLatLng(), map.getZoom(), { animate: true });
    }
}

// Initialisation au chargement
window.onload = function() {
    initMap();
    search(); // Charge les résultats par défaut
};