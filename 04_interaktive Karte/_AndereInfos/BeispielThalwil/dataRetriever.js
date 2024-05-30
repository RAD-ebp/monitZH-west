export async function fetchAdressData(inputValue) {
  /*fetch address data for input string from swisstopo:*/
  const queryString = `?sr=${config.adressServiceConfig.sr}&searchText=${inputValue}%20Thalwil&lang=${config.adressServiceConfig.lang}&type=${config.adressServiceConfig.type}&bbox=${config.adressServiceConfig.bbox}`;
  const requestUrl = config.adressServiceConfig.baseUrl + queryString;
  try {
    const response = await fetch(requestUrl);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.log('Fehler beim Abrufen der Adressen:', error);
  }
}

export async function getAdressDataForCoordinates(coord) {
  /*get adressdata for selected coordinates from swisstopo:*/
  const queryString = `?geometry=${coord}&geometryFormat=${config.adressForCoordinateServiceConfig.geometryFormat}&geometryType=${config.adressForCoordinateServiceConfig.geometryType}&imageDisplay=${config.adressForCoordinateServiceConfig.imageDisplay}&lang=${config.adressForCoordinateServiceConfig.lang}&layers=${config.adressForCoordinateServiceConfig.layer}&limit=${config.adressForCoordinateServiceConfig.limit}&mapExtent=${config.adressForCoordinateServiceConfig.bbox}&returnGeometry=true&sr=${config.adressForCoordinateServiceConfig.sr}&tolerance=${config.adressForCoordinateServiceConfig.tolerance}`;
  const requestUrl = config.adressForCoordinateServiceConfig.baseUrl + queryString;
  try {
    const response = await fetch(requestUrl);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.log('Fehler beim Abrufen der Adressen:', error);
  }
}

export async function getGebietInformationFromCodeliste(gebietsNummer) {
  /*import json with all Energiegebiete in the Energieplan:*/

  const url = './codeliste_EnergieplanGebiete.json';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[gebietsNummer];
  } catch (error) {
    console.error('Error fetching JSON file:', error);
    throw error;
  }
}

export async function getEnergieTrägerOptionFromCodeliste(option) {
  /*import json with all Energieträgeroptionen:*/

  const url = './codeliste_EnergieträgerOptionen.json';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[option];
  } catch (error) {
    console.error('Error fetching JSON file:', error);
    throw error;
  }
}

export async function getEnergieplanLayersFromGeojson(option) {
  /*import the features for the energieplanlayers:*/

  const url = './energieplan_json.geojson';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching JSON file:', error);
    throw error;
  }
}
