import L from "leaflet";

export const createTileLayers = () => {
  const baseMaps = {};

  // OpenStreetMap
  baseMaps["OpenStreet"] = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    noWrap: true,
    maxZoom: 19,
    minZoom: 4,
  });

  // Mapbox
  const mapBoxToken =
    "pk.eyJ1IjoiaW5mb21haGVuZHJhMjAwOSIsImEiOiJjazhzbXZrMTQwMTVmM2ttcmZwbndtbW0zIn0.sqB_84_aQimwdNnty7DjCQ";
  const mapBoxStyles = [
    { name: "MapBoxStreet", value: "streets-v9" },
    { name: "MapBoxDark", value: "dark-v9" },
  ];

  mapBoxStyles.forEach((style) => {
    baseMaps[style.name] = L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/${style.value}/tiles/{z}/{x}/{y}?access_token=${mapBoxToken}`,
      {
        attribution: "Map data © OpenStreetMap contributors, Imagery © Mapbox",
        maxZoom: 20,
        minZoom: 3,
        noWrap: true,
      }
    );
  });

  // HERE Maps
  const hereApiKey = "7snf2Sz_ORd8AClElg9h43HXV8YPI1pbVHyz2QvPsZI";
  const hereStyles = [
    { name: "HereStreet", value: "reduced.day" },
    { name: "HereNight", value: "reduced.night" },
  ];

  hereStyles.forEach((style) => {
    baseMaps[style.name] = L.tileLayer(
      `https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/${style.value}/{z}/{x}/{y}/512/png8?apiKey=${hereApiKey}&ppi=320`,
      {
        attribution: "&copy; HERE 2019",
        noWrap: true,
        maxZoom: 19,
        minZoom: 4,
      }
    );
  });

  // Google Maps
  baseMaps["GoogleStreets"] = L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    minZoom: 3,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  });

  baseMaps["GoogleSatellite"] = L.tileLayer("http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    minZoom: 3,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  });

  baseMaps["GoogleTraffic"] = L.tileLayer(
    "https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}",
    {
      maxZoom: 20,
      minZoom: 3,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
  );

  return baseMaps;
};
