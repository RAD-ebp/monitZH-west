import { fetchAdressData } from './dataRetriever.js';
import { makeSelectedLayerVisible } from './mapControls.js';
import {
  getAdressDataForCoordinates,
  getEnergieTrägerOptionFromCodeliste,
  getGebietInformationFromCodeliste,
} from './dataRetriever.js';

export default function autocomplete(inp, newMapControl) {
  var currentFocus;
  let adressList = [];
  /*execute resultList function when someone writes in the text field:*/
  inp.addEventListener('input', function (e) {
    var resultList,
      resultListItem,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    if (containsOnlyNumbers(val)) {
      fetchAdressData(val).then(response => {
        addResultList(response.results, this.parentNode, 'Hausnummer', val);
      });
    } else if (val.length > 2) {
      fetchAdressData(val).then(response => {
        if (containsOnlyNumbers(val)) {
          addResultList(response.results, this.parentNode, 'Hausnummer', val);
        } else if (!containsOnlyNumbers(val && val.length > 2)) {
          addResultList(response.results, this.parentNode, 'Adresse', val);
        }
      });
    } else {
      let resultList = createResultlistControl(this.parentNode);
      addNoAdressFoundToResultListControl(resultList);
    }
  });

  function addResultList(results, parentN, searchType, val) {
    /*create resultList DIV element that will contain all the adresses*/
    let resultList = createResultlistControl(parentN);

    if (resultList.childElementCount !== 0) {
      resultList.removeChild();
    }
    /*Add resultList title to the DIV element depending if searching for adress or number*/
    addSearchTypeInformationToResultListControl(resultList, searchType);

    if (results.length === 0) {
      addNoAdressFoundToResultListControl(resultList);
    } else {
      addResultsToResultListControl(resultList, results, val);
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
    var x = document.getElementsByClassName('autocomplete-items');
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }
  function addResultsToResultListControl(resultList, results, val) {
    for (let i = 0; i < config.resultListLimit; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (results[i].attrs.label && results[i].attrs.origin === 'address') {
        /*create resultList DIV element for each matching element:*/
        let resultListItem = document.createElement('DIV');
        /*make the matching letters bold:*/
        const adressLabel = results[i].attrs.label.split('<b>')[0];
        resultListItem.innerHTML += adressLabel.replace(val, '<strong>' + val + '</strong>');
        /*insert resultList input field that will hold the currentresultsay item's value:*/
        resultListItem.innerHTML +=
          "<input id= '" + i + "' type='hidden'  value='" + adressLabel + "'>";
        /*execute resultList function when someone clicks on the item value (DIV element):*/
        resultListItem.addEventListener('click', function (e) {
          /*insert the value for the autocomplete text field:*/
          const resultListId = Number(this.getElementsByTagName('input')[0].id);
          const adressObject = results[resultListId].attrs;
          const adressCoordinates = [adressObject.lat, adressObject.lon];
          displayEnergyInformationForAdress([adressObject.lon, adressObject.lat], newMapControl);
          inp.value = this.getElementsByTagName('input')[0].value;
          /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        resultList.appendChild(resultListItem);
      } else {
        addNoAdressFoundToResultListControl(resultList);
        break;
      }
    }
  }

  function createResultlistControl(parentN) {
    let resultList = document.createElement('DIV');
    resultList.setAttribute('id', parentN.id + 'autocomplete-list');
    resultList.setAttribute('class', 'autocomplete-items');
    /*append the DIV element as resultList child of the autocomplete container:*/
    parentN.appendChild(resultList);
    return resultList;
  }

  function addSearchTypeInformationToResultListControl(resultList, searchType) {
    let resultListTitle = document.createElement('DIV');
    const b = document.createElement('B');
    b.textContent = searchType;
    resultListTitle.appendChild(b);
    resultList.appendChild(resultListTitle);
  }

  function addNoAdressFoundToResultListControl(resultList) {
    let resultListItem = document.createElement('DIV');
    resultListItem.textContent = 'Keine Vorschläge';
    /*insert resultList input field that will hold the currentresultsay item's value:*/
    resultList.appendChild(resultListItem);
  }

  /*execute resultList function when someone clicks in the document:*/
  document.addEventListener('click', function (e) {
    closeAllLists(e.target);
    adressList = [];
  });
}

function setAdressInInputIfNotExists(coord) {
  /*project coordinates from ES84 to ESPG2056:*/
  const coordEPSG2056 = proj4(proj4('EPSG:4326'), proj4('EPSG:2056'), [coord[0], coord[1]]);
  getAdressDataForCoordinates(coordEPSG2056).then(
    response =>
      (document.getElementById('adressInput').value =
        response.results.length > 0 ? response.results[0].properties.strname_deinr : '')
  );
}

function createEnergyInformationAccordion(searchcontrol) {
  /*create html structure for the energyinformation accordion:*/
  if (document.getElementById('energyInfoAccordion')) {
    document.getElementById('energyInfoAccordion').remove();
  } else if (document.getElementById('energyInformationNotFoundCard')) {
    document.getElementById('energyInformationNotFoundCard').remove();
  }
  const accordion = document.createElement('DIV');
  accordion.setAttribute('class', 'accordion m-4 w-90');
  accordion.setAttribute('id', 'accordion');
  searchcontrol.appendChild(accordion);
  return accordion;
}

function createAccordionItem(data, type) {
  /*create html structure and insert data for each accordion item :*/
  const accordionItem = document.createElement('DIV');
  accordionItem.setAttribute('class', 'accordion-item w-90');
  const acccordionHeader = document.createElement('h2');
  acccordionHeader.setAttribute('class', 'accordion-header');
  acccordionHeader.setAttribute('id', `${type}Header`);
  const accordionButton = document.createElement('button');
  accordionButton.setAttribute('class', 'accordion-button collapsed');
  accordionButton.setAttribute('type', 'button');
  accordionButton.setAttribute('data-bs-toggle', 'collapse');
  accordionButton.setAttribute('data-bs-target', `#${type}`);
  accordionButton.setAttribute('aria-expanded', 'false');
  accordionButton.setAttribute('aria-controls', `${type}`);
  if (type === 'main') {
    accordionButton.setAttribute('class', 'accordion-button');
    accordionButton.setAttribute('aria-expanded', 'true');
  }
  accordionButton.textContent = data.Name;
  acccordionHeader.appendChild(accordionButton);
  if (type === 'main') {
    const badge = document.createElement('SPAN');
    badge.setAttribute('class', 'badge badge-pill badge-color mx-3');
    badge.textContent = 'EMPFOHLEN';
    accordionButton.appendChild(badge);
  }
  const accordionPanel = document.createElement('DIV');
  if (type === 'main') {
    accordionPanel.setAttribute('class', 'accordion-collapse collapse show');
  } else {
    accordionPanel.setAttribute('class', 'accordion-collapse collapse');
  }
  accordionPanel.setAttribute('id', `${type}`);
  accordionPanel.setAttribute('aria-labelledby', `${type}Header`);
  if (type !== 'main') {
    accordionPanel.setAttribute('data-bs-parent', '#energyInfoAccordion');
  }
  const accordionBody = document.createElement('DIV');
  accordionBody.setAttribute('class', 'accordion-body');
  if (data.Name === 'Solarwärme') {
    accordionBody.innerHTML = data.Text;
  } else {
    accordionBody.textContent = data.Text;
  }
  accordionPanel.appendChild(accordionBody);
  accordionItem.appendChild(acccordionHeader);
  accordionItem.appendChild(accordionPanel);
  const address = createAndPopulateAdress(data.Kontakt);
  accordionBody.appendChild(address);
  accordionBody.appendChild(createURLElement(data.URL));
  return accordionItem;
}

function createURLElement(url) {
  const urlElement = document.createElement('a');
  urlElement.setAttribute('href', url);
  urlElement.setAttribute('class', 'btn btn-primary');
  urlElement.textContent = 'Weitere Informationen';
  return urlElement;
}

function createInteractionElement(key, value) {
  const adressItem = document.createElement('DIV');
  adressItem.setAttribute('style', 'display:flex');
  const adressKey = document.createElement('DIV');
  adressKey.setAttribute('style', 'margin-right:2px');

  adressKey.textContent = `${key}: `;
  const urlElement = document.createElement('a');
  if (key === 'Tel.') {
    urlElement.setAttribute('href', `tel:+41${value}`);
  } else if (key === 'E-Mail') {
    urlElement.setAttribute('href', `mailto:${value}`);
  }
  urlElement.textContent = ` ${value}`;
  adressItem.appendChild(adressKey);
  adressItem.appendChild(urlElement);
  return adressItem;
}

function createAndPopulateAdress(kontakt) {
  /*create html structure for an address and sinert information:*/
  const adressElement = document.createElement('ADDRESS');
  adressElement.setAttribute('class', 'mt-4');
  let tempPLZ = '';
  for (const [key, value] of Object.entries(kontakt)) {
    const adressItem = document.createElement('DIV');
    if (key === 'Tel.' || key === 'E-Mail') {
      adressElement.appendChild(createInteractionElement(key, value));
    } else if (key === 'Postleitzahl') {
      tempPLZ = value;
    } else if (key === 'Gemeinde') {
      adressItem.textContent = `${tempPLZ ? tempPLZ : ''} ${value}`;
    } else {
      adressItem.textContent = `${value}`;
    }
    adressElement.appendChild(adressItem);
  }
  return adressElement;
}

function createAndPopulateEnergyAccordionToSearchControl(response, searchControl) {
  const accordionElement = createEnergyInformationAccordion(searchControl);
  accordionElement.setAttribute('id', 'energyInfoAccordion');
  accordionElement.appendChild(createAccordionItem(response, 'main'));
  response.EnergieOptionen.forEach((option, idx) => {
    getEnergieTrägerOptionFromCodeliste(option).then(data => {
      accordionElement.appendChild(createAccordionItem(data, `option${idx}`));
    });
  });
}

function createEnergyInformationNotFoundCard() {
  /*create html structure bootstrap card:*/
  const energyInformationCard = document.createElement('DIV');
  energyInformationCard.setAttribute('class', 'card m-4');
  energyInformationCard.setAttribute('id', 'energyInformationNotFoundCard');
  const energyInformationCardBody = document.createElement('DIV');
  energyInformationCardBody.setAttribute('class', 'card-body');
  energyInformationCardBody.textContent = noEnergieTrägerFoundForSelectionString();
  energyInformationCard.appendChild(energyInformationCardBody);
  return energyInformationCard;
}

function createAndPopulateNoEnergieTrägerFoundCard(searchControl) {
  if (document.getElementById('energyInfoAccordion')) {
    document.getElementById('energyInfoAccordion').remove();
  } else if (document.getElementById('energyInformationNotFoundCard')) {
    document.getElementById('energyInformationNotFoundCard').remove();
  }
  searchControl.appendChild(createEnergyInformationNotFoundCard());
}

function noEnergieTrägerFoundForSelectionString() {
  return 'Leider konnte für Ihre Auswahl kein empfohlener Energieträger in unserem System gefunden werden. Ist es möglich, dass sich Ihre Auswahl nicht mehr auf dem Gemeindegebiet von Thalwil befindet?';
}

export function displayEnergyInformationForAdress(coord, mapControl) {
  mapControl.deleteAllLayersOnMapIfExist();
  const searchControl = document.getElementById('searchControl');
  let energiePlanExistsForSelection = false;
  let point = turf.point(coord);
  mapControl.layerList.forEach(element => {
    element.getLayers().forEach(layer => {
      var searchWithin = turf.polygon([...layer.feature.geometry.coordinates]);
      /*if selected coordinate is in a specific Energieträgerlayer add a marker, make the selected energietägerlayer visible and set the selected adress into input field:*/
      if (turf.booleanPointInPolygon(point, searchWithin)) {
        const energiePlanNummer = layer.feature.properties.nummer;
        mapControl.addMarkerToMap([coord[1], coord[0]]);
        makeSelectedLayerVisible(mapControl.map, energiePlanNummer);
        setAdressInInputIfNotExists(coord);
        energiePlanExistsForSelection = true;
        getGebietInformationFromCodeliste(energiePlanNummer).then(response => {
          createAndPopulateEnergyAccordionToSearchControl(response, searchControl);
        });
      }
    });
  });
  if (energiePlanExistsForSelection === false) {
    createAndPopulateNoEnergieTrägerFoundCard(searchControl);
  }
}
