/* ================================
   DISPATCH GLOBE – FRONTEND APP
   Dispatcher-Grade Cesium UI
================================ */

let liveMode = true;
let userInteracting = false;
let heatmapEnabled = false;

const API_BASE = "http://localhost:3000";
const WS_BASE  = "http://localhost:3000";

/* ================================
   CESIUM VIEWER SETUP
================================ */

const viewer = new Cesium.Viewer("cesium", {
  timeline: true,
  animation: true,
  baseLayerPicker: false,
  geocoder: false,
  sceneModePicker: false,
  homeButton: false,
  infoBox: false,
  selectionIndicator: true
});

viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

/* Detect manual camera movement (prevents auto-jumping) */
viewer.camera.moveStart.addEventListener(() => {
  userInteracting = true;
});
viewer.camera.moveEnd.addEventListener(() => {
  setTimeout(() => (userInteracting = false), 3000);
});

/* ================================
   HEATMAP PRIMITIVES
================================ */

const heatmap = viewer.scene.primitives.add(
  new Cesium.PointPrimitiveCollection()
);

/* ================================
   ICON & COLOR HELPERS
================================ */

function unitIcon(type) {
  return `/icons/${type || "engine"}.png`;
}

function unitColor(type) {
  const colors = {
    engine: Cesium.Color.RED,
    medic: Cesium.Color.CYAN,
    police: Cesium.Color.NAVY,
    rescue: Cesium.Color.ORANGE
  };
  return colors[type] || Cesium.Color.WHITE;
}

/* ================================
   ADD DISPATCH ENTITY
================================ */

function addDispatch(evt) {
  if (!evt.lat || !evt.lon) return null;

  const start = Cesium.JulianDate.fromIso8601(evt.received_at);

  return viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({ start })
    ]),
    position: Cesium.Cartesian3.fromDegrees(evt.lon, evt.lat),
    billboard: {
      image: unitIcon(evt.unit_type),
      scale: 0.85,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    },
    point: {
      pixelSize: 10,
      color: unitColor(evt.unit_type)
    },
    properties: evt
  });
}

/* ================================
   AUTO-FOCUS LOGIC
================================ */

function focusOn(entity) {
  if (!liveMode || userInteracting || !entity) return;

  viewer.flyTo(entity, {
    duration: 1.3,
    offset: new Cesium.HeadingPitchRange(
      0,
      Cesium.Math.toRadians(-45),
      3000
    )
  });
}

/* ================================
   LOAD DISPATCHES BY TIME RANGE
================================ */

async function loadRange(range) {
  viewer.entities.removeAll();
  heatmap.removeAll();

  const res = await fetch(`${API_BASE}/dispatch?range=${range}`);
  const data = await res.json();

  let startTime = null;
  let endTime   = null;

  data.forEach(evt => {
    const entity = addDispatch(evt);
    if (!entity) return;

    const t = Cesium.JulianDate.fromIso8601(evt.received_at);
    if (!startTime || Cesium.JulianDate.lessThan(t, startTime)) startTime = t;
    if (!endTime   || Cesium.JulianDate.greaterThan(t, endTime)) endTime = t;
  });

  if (startTime && endTime) {
    viewer.clock.startTime = startTime.clone();
    viewer.clock.stopTime  = endTime.clone();
    viewer.clock.currentTime = startTime.clone();
    viewer.clock.multiplier = 60;
    viewer.timeline.zoomTo(startTime, endTime);
  }
}

/* ================================
   LOAD HEATMAP
================================ */

async function loadHeatmap(range) {
  heatmap.removeAll();
  if (!heatmapEnabled) return;

  const res = await fetch(`${API_BASE}/dispatch/heatmap?range=${range}`);
  const data = await res.json();

  data.forEach(p => {
    heatmap.add({
      position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat),
      pixelSize: Math.min(30, p.weight * 5),
      color: Cesium.Color.RED.withAlpha(0.35)
    });
  });
}

/* ================================
   ENTITY SELECTION PANEL
================================ */

const panel = document.getElementById("panel");

viewer.selectedEntityChanged.addEventListener(entity => {
  if (!entity || !entity.properties) {
    panel.innerHTML = "";
    return;
  }

  const p = entity.properties;

  panel.innerHTML = `
    <h3>${p.address || "Dispatch Event"}</h3>
    <p><strong>Units:</strong> ${p.units || "N/A"}</p>
    <p><strong>Time:</strong> ${p.received_at}</p>
    <p>${p.transcript || ""}</p>
    ${
      p.audio_file
        ? `<audio controls src="${p.audio_file}"></audio>`
        : ""
    }
  `;
});

/* ================================
   LIVE WEBSOCKET FEED
================================ */

const socket = io(WS_BASE);

socket.on("dispatch:new", evt => {
  const entity = addDispatch(evt);
  focusOn(entity);
});

/* ================================
   UI CONTROLS (HOOKS)
================================ */

/* Example global hooks (wire from HTML buttons) */

window.setRange = async function (range) {
  liveMode = false;
  await loadRange(range);
  await loadHeatmap(range);
};

window.toggleLive = function () {
  liveMode = !liveMode;
};

window.toggleHeatmap = async function (range) {
  heatmapEnabled = !heatmapEnabled;
  await loadHeatmap(range);
};

/* ================================
   INITIAL LOAD
================================ */

loadRange("day");
