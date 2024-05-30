import { displayEnergyInformationForAdress } from './searchControl.js';
import { getEnergieplanLayersFromGeojson } from './dataRetriever.js';
export default class MapControl {
  map;
  layerGroup;
  markerLayer;
  selectedAdress;
  layerGroupNameList;
  layerList = [];

  constructor() {
    proj4.defs(
      'EPSG:2056',
      '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 ' +
        '+k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel ' +
        '+towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
    );
    this.layerGroupNameList = [];
  }

  createLeafletMap() {
    /*set projection lv95:*/
    var lv95 = {
      epsg: 'EPSG:2056',
      def: '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
      resolutions: [
        67.7333333333, 33.8666666667, 16.9333333333, 8.4666666667, 4.2333333333, 2.1166666667,
        1.0583333333, 0.5291666667, 0.2645833333, 0.1322916667, 0.0661458333,
      ],
      origin: [2480237.0, 1315832.0],
      bounds: L.bounds([2480237.0, 1062032.0], [2846837.0, 1315832.0]),
    };
    var crs = new L.Proj.CRS(lv95.epsg, lv95.def, {
      resolutions: lv95.resolutions,
      origin: lv95.origin,
    });
    /*create map:*/
    this.map = new L.Map('map', {
      crs: crs,
      maxZoom: crs.options.resolutions.length,
    }).setView(config.backGroundMapConfig.mapCenter, config.backGroundMapConfig.zoom);

    /*disable possibility to zoom in map by scrolling wheel:*/
    this.map.scrollWheelZoom.disable();

    L.tileLayer(config.backGroundMapConfig.url, {
      maxZoom: crs.options.resolutions.length,
      tileSize: 512,
    }).addTo(this.map);
    /*set bounds and min zoom of map:*/
    this.map.setMaxBounds(this.map.getBounds()).setMinZoom(this.map.getZoom() + 1);
    this.layerGroup = L.layerGroup().addTo(this.map);
    this.createGeoJsonEnergieplanLayer();
    this.map.on('click', e => this.onClickHandler(e));
  }

  onClickHandler(e) {
    var coord = e.latlng;
    displayEnergyInformationForAdress([coord.lng, coord.lat], this);
  }

  createGeoJsonEnergieplanLayer() {
    getEnergieplanLayersFromGeojson().then(data =>
      data.features.forEach(feature => {
        this.addFeature(feature);
      })
    );
  }

  addFeature(feature) {
    /*add each feature to specific layer:*/

    const list = this.layerList.filter(l => l.name === feature.properties.nummer);
    let layer;
    if (list.length > 0) {
      layer = list[0];
    }
    if (!layer) {
      layer = L.geoJson();
      layer.name = feature.properties.nummer;
      this.layerList.push(layer);
      this.map.addLayer(layer);
    }
    layer.addData(feature);
    layer.setStyle({ fillColor: 'white', color: 'none', fillOpacity: 0 });
  }

  addMarkerToMap(coordinates) {
    document.getElementById('adressInput').value = '';
    const adressLocationMarker = L.marker(coordinates);
    this.markerLayer = adressLocationMarker;
    this.map.addLayer(adressLocationMarker);
    this.map.flyTo(coordinates, 7);
  }

  deleteAllLayersOnMapIfExist() {
    deleteMarkerOnMapIfExist(this.map, this.markerLayer);
    hideEachLayerOnMapIfExist(this.map);
  }
}

export function makeSelectedLayerVisible(map, layerName) {
  /*set style of selected layer so that it is visible:*/
  map.eachLayer(function (layer) {
    if (layer.feature && layer.feature.properties.nummer === layerName) {
      layer.setStyle({ fillColor: 'blue', color: 'blue', fillOpacity: 0.2 });
    }
  });
}

function deleteMarkerOnMapIfExist(map, markerLayer) {
  if (markerLayer) {
    map.removeLayer(markerLayer);
  }
}

function hideEachLayerOnMapIfExist(map) {
  /*set style of each layer of map so that it is not visible:*/
  map.eachLayer(function (layer) {
    if (layer.feature) {
      layer.setStyle({ fillColor: 'blue', color: 'none', fillOpacity: 0 });
    }
  });
}
