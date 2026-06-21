import {
    Cartesian3,
    Math as CesiumMath,
    Terrain,
    Viewer,
    Cesium3DTileset,
    Ion,

} from "cesium";

// widgets.css is injected automatically by vite-plugin-cesium.
import "./style.css";
import * as Cesium from "cesium";





// Cesium Ion token is read from the environment (see .env.local).
// Set VITE_CESIUM_ION_TOKEN there; never commit a real token to git.
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;




// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
    terrain: Terrain.fromWorldTerrain(),

});
console.log(viewer.scene.primitives);

// Fly the camera to Uhldingen-Mühlhofen at the given longitude, latitude, and height.
viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(9.235000, 47.7103300, 1000),
    orientation: {
        heading: CesiumMath.toRadians(0.0),
        pitch: CesiumMath.toRadians(-15.0),
    },
});

// bereits bestehende Tiles aus Terrain entfernen
//osmBuildings.show = false;

const layers = {
    buildings: null,
    tilesets: []
};

// Liste deiner Asset-IDs
const assetIds = [4970012, 4970011];

for (const id of assetIds) {
    const tileset = await Cesium3DTileset.fromIonAssetId(id);

    viewer.scene.primitives.add(tileset);
    tileset.shadows = Cesium.ShadowMode.ENABLED;
    // Kontrolle, ob die Tiles geladen wurden
    console.log("Tileset geladen:", tileset);
}

// Additional funktionalities

//Schatten anzeigen
viewer.scene.shadowMap.enabled = true;
viewer.scene.globe.enableLighting = true;

// Aktuellezeit
const sunPosition = Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
    viewer.clock.currentTime
);
console.log(sunPosition);
// Zeit soll vergehen für den Schattenlauf
viewer.clock.shouldAnimate = true;
// 1 Sekunde = 1/3 Stunde
viewer.clock.multiplier = 1200;





// Koordinatenantzeige des Mauszeigers

// Anzeigefeld für die Koordinaten
const coordinateDiv = document.createElement("div");

coordinateDiv.style.position = "absolute";
coordinateDiv.style.bottom = "30px";
coordinateDiv.style.right = "10px";
coordinateDiv.style.padding = "5px 10px";
coordinateDiv.style.background = "rgba(0,0,0,0.7)";
coordinateDiv.style.color = "white";
coordinateDiv.style.fontFamily = "Arial";
coordinateDiv.style.fontSize = "12px";
coordinateDiv.style.zIndex = "1000";

document.body.appendChild(coordinateDiv);


// Aufzeichnung und Aktualisierung der Koordinaten des Mauszeigers im erstellten Anzeigefeld

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((movement) => {

    const cartesian = viewer.scene.pickPosition(movement.endPosition);

    if (!Cesium.defined(cartesian)) {
        coordinateDiv.innerHTML = "Keine Position";
        return;
    }

    const cartographic =
        Cesium.Cartographic.fromCartesian(cartesian);

    const lon =
        Cesium.Math.toDegrees(cartographic.longitude);

    const lat =
        Cesium.Math.toDegrees(cartographic.latitude);

    const height =
        cartographic.height;

    coordinateDiv.innerHTML = `
        Lon: ${lon.toFixed(6)}°<br>
        Lat: ${lat.toFixed(6)}°<br>
        Höhe: ${height.toFixed(2)} m
    `;

}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



// Anzeige der ID des Gebäudes bei hoverrnüber dem Gebäude

// Erstellen der Textbox über der Maus
const tooltip = document.createElement("div");

tooltip.style.position = "absolute";
tooltip.style.display = "none";
tooltip.style.padding = "4px 8px";
tooltip.style.background = "rgba(0,0,0,0.8)";
tooltip.style.color = "white";
tooltip.style.borderRadius = "4px";
tooltip.style.fontSize = "20px";
tooltip.style.pointerEvents = "none";
tooltip.style.zIndex = "1000";

// mittig über Maus positionieren
tooltip.style.transform = "translate(-50%, -100%)";

document.body.appendChild(tooltip);

// Erstellen der Hovermechanik, damit die Information erst nach 1 Sekunde erscheint
const hoverHandler = new Cesium.ScreenSpaceEventHandler(
    viewer.scene.canvas
);

let hoverTimer = null;
let hoveredFeature = null;

hoverHandler.setInputAction((movement) => {

    const pickedFeature =
        viewer.scene.pick(movement.endPosition);

    // Alten Timer abbrechen
    clearTimeout(hoverTimer);

    // Tooltip verstecken
    tooltip.style.display = "none";

    // Nichts getroffen
    if (!Cesium.defined(pickedFeature)) {
        hoveredFeature = null;
        return;
    }

    hoveredFeature = pickedFeature;

    // Nach 1 Sekunde anzeigen
    hoverTimer = setTimeout(() => {

        const currentPick =
            viewer.scene.pick(movement.endPosition);

        // Maus inzwischen auf anderem Objekt?
        if (currentPick !== hoveredFeature) {
            return;
        }

        if (
            typeof hoveredFeature.getProperty === "function"
        ) {

            // Property-Namen sind für CityGML Daten des LGL-BW falls nötig abändern!!!
            const gmlId =
            hoveredFeature.getProperty("gml:id");

            const height =
            hoveredFeature.getProperty("Height");

        const heightText =
            typeof height === "number"
                ? height.toFixed(2)
                : "-";

            tooltip.innerHTML = `
                <b>Gebäude_id</b>: ${gmlId ?? "-"}<br>
                <b>Height</b>: ${heightText} m
                `;

            // 10 Pixel über Maus
            tooltip.style.left =
                movement.endPosition.x + "px";

            tooltip.style.top =
                (movement.endPosition.y - 10) + "px";

            tooltip.style.display = "block";
        }

    }, 1000);

}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);





