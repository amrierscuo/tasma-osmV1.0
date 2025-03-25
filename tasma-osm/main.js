let map;
let markers = {};
let geoJsonData = {};
let propertyStatus = {};
let allLayers = [];
let selectedProperties = {};

let layerNames = ['atlante_toponomastico.geojson', 'AreeSpecialiMilitari.geojson'];

function initMap() {
  map = L.map('map').setView([40.1209, 9.0129], 8);

  let openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  });

  let satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ',
  });

  let mapboxStreetsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ',
  });

  let mapboxSatelliteStreetsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ',
  });

  let mapboxOutdoorsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ',
  });

  let baseMaps = {
    'OpenStreetMap': openStreetMapLayer,
    'Satellite': satelliteLayer,
    'Mapbox Streets': mapboxStreetsLayer,
    'Mapbox Satellite Streets': mapboxSatelliteStreetsLayer,
    'Mapbox Outdoors': mapboxOutdoorsLayer
  };
  openStreetMapLayer.addTo(map);

  let searchBox = document.getElementById('search-box');
  searchBox.disabled = true;
  searchBox.style.backgroundColor = '#ddd';

function updatePopupContent(feature, layer) {
  let popupContent = '';
  let popupContent1 = '';
  let additionalPopupContent = '';

  let propertyCount = 0; // Contatore per limitare le prime 2 properties nel popupContent1

  for (let property in feature.properties) {
    let checkbox = document.getElementById(property);
    if (checkbox && checkbox.checked) {
      popupContent += property.toUpperCase() + ': ' + feature.properties[property] + '<br>';

      if (propertyCount < 2) {
        popupContent1 += property.toUpperCase() + ': ' + feature.properties[property] + '<br>';
        propertyCount++;
      } else {
        additionalPopupContent += property.toUpperCase() + ': ' + feature.properties[property] + '<br><br>';
      }
    }
  }

  if (popupContent1 !== '') {
    popupContent1 += '<br><em>For more details, check the popup in the right.</em>'; // Aggiunta del commento nel popupContent1
  }

  layer.bindPopup(popupContent1);

layer.on('click', function (e) {
  let additionalPopupDiv = document.getElementById('additional-popup');
  additionalPopupDiv.innerHTML = ''; // Pulisci il contenuto precedente
  let additionalPopupContentDiv = document.createElement('div');
  additionalPopupContentDiv.innerHTML = additionalPopupContent; // Aggiungi il contenuto al div creato dinamicamente
  additionalPopupDiv.appendChild(additionalPopupContentDiv);
  layer.openPopup();
});


}






  document.getElementById('geojson-file').addEventListener('change', function() {
    let files = this.files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if (layerNames.includes(file.name)) {
        loadGeoJSONFile(file);
      }
    }
  });

  function loadGeoJSONFile(file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      geoJsonData[file.name] = JSON.parse(e.target.result);
      if (markers[file.name]) {
        markers[file.name].clearLayers();
      } else {
        markers[file.name] = L.markerClusterGroup();
      }
      let geoJsonLayer = L.geoJSON(geoJsonData[file.name], {
        onEachFeature: function(feature, layer) {
          allLayers.push({ feature: feature, layer: layer });
          let popupContent = '';

          let propertySelectPanel = document.getElementById('property-checkboxes');
          propertySelectPanel.innerHTML = '';

          if (file.name === layerNames[0]) {
            for (let property in feature.properties) {
              let checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.id = property;
              checkbox.name = property;
              checkbox.value = property;
              checkbox.checked = propertyStatus[property] !== false;

              checkbox.addEventListener('change', function() {
                propertyStatus[property] = this.checked;
                allLayers.forEach(function(obj) {
                  updatePopupContent(obj.feature, obj.layer);
                });
              });

              let label = document.createElement('label');
              label.htmlFor = property;
              label.appendChild(document.createTextNode(property));

              propertySelectPanel.appendChild(checkbox);
              propertySelectPanel.appendChild(label);
              propertySelectPanel.appendChild(document.createElement('br'));

              if (checkbox.checked) {
                popupContent += property.toUpperCase() + ': ' + feature.properties[property] + '<br>';
              }
            }
          } else {
            for (let property in feature.properties) {
              if (feature.properties.hasOwnProperty(property)) {
                popupContent += property.toUpperCase() + ': ' + feature.properties[property] + '<br>';
              }
            }
          }

          markers[file.name].addLayer(layer);
          layer.bindPopup(popupContent);
        }
      });
      map.addLayer(markers[file.name]);

      searchBox.disabled = false;
      searchBox.style.backgroundColor = '#fff';

      let layerControlPanel = document.getElementById('layer-control-panel');

      let checkboxLabel = document.createElement('label');
      checkboxLabel.htmlFor = 'layer-control-' + file.name;
      checkboxLabel.style.display = 'block';
      checkboxLabel.style.textAlign = 'left';

      let filenameText = document.createTextNode(file.name);
      checkboxLabel.appendChild(filenameText);

      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'layer-control-' + file.name;
      checkbox.checked = true;
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          map.addLayer(markers[file.name]);
        } else {
          map.removeLayer(markers[file.name]);
        }
      });

      layerControlPanel.appendChild(checkboxLabel);
      layerControlPanel.appendChild(checkbox);
      layerControlPanel.appendChild(document.createElement('br'));
    };
    reader.readAsText(file);
  }

  searchBox.addEventListener('input', function() {
    let searchString = this.value.toLowerCase();
    let matchedFeatures = {};

    for (let fileName in geoJsonData) {
      matchedFeatures[fileName] = [];
      geoJsonData[fileName].features.forEach(function(feature) {
        for (let property in feature.properties) {
          if (feature.properties.hasOwnProperty(property) && typeof feature.properties[property] === 'string' && feature.properties[property].toLowerCase().includes(searchString)) {
            matchedFeatures[fileName].push(feature);
            break;
          }
        }
      });
    }

    let propertySelectPanel = document.getElementById('property-checkboxes');
    propertySelectPanel.innerHTML = '';

    for (let fileName in markers) {
      if (markers[fileName]) {
        markers[fileName].clearLayers();
        markers[fileName] = L.markerClusterGroup();
        let geoJsonLayer = L.geoJSON(matchedFeatures[fileName], {
          onEachFeature: function(feature, layer) {
            let popupContent = '';
            if (fileName === layerNames[0]) {
              for (let property in feature.properties) {
                let checkbox = document.getElementById(property);
                if (!checkbox) {
                  checkbox = document.createElement('input');
                  checkbox.type = 'checkbox';
                  checkbox.id = property;
                  checkbox.name = property;
                  checkbox.value = property;
                  checkbox.checked = propertyStatus[property] !== false;

                  checkbox.addEventListener('change', function() {
                    propertyStatus[property] = this.checked;
                    allLayers.forEach(function(obj) {
                      updatePopupContent(obj.feature, obj.layer);
                    });
                  });

                  let label = document.createElement('label');
                  label.htmlFor = property;
                  label.appendChild(document.createTextNode(property));

                  propertySelectPanel.appendChild(checkbox);
                  propertySelectPanel.appendChild(label);
                  propertySelectPanel.appendChild(document.createElement('br'));
                }

                if (checkbox.checked) {
                  popupContent += property.toUpperCase() + ': ' + feature.properties[property] + '<br>';
                }
              }
            } else {
              for (let property in feature.properties) {
                if (feature.properties.hasOwnProperty(property)) {
                  popupContent += property.toUpperCase() + ': ' + feature.properties[property] + '<br>';
                }
              }
            }

            markers[fileName].addLayer(layer);
            layer.bindPopup(popupContent);
          }
        });
        map.addLayer(markers[fileName]);
      }
    }
  });

  document.getElementById('remove-geojson').addEventListener('click', function() {
    for (let fileName in markers) {
      if (markers[fileName]) {
        markers[fileName].clearLayers();
        markers[fileName] = null;
        delete geoJsonData[fileName];

        let checkbox = document.getElementById('layer-control-' + fileName);
        checkbox.parentNode.removeChild(checkbox);
        let label = document.querySelector('label[for="layer-control-' + fileName + '"]');
        label.parentNode.removeChild(label);

        let propertySelectPanel = document.getElementById('property-checkboxes');
        propertySelectPanel.innerHTML = '';
      }
    }

    searchBox.disabled = true;
    searchBox.style.backgroundColor = '#ddd';

    location.reload();
  });

  let layerControl = L.control.layers(baseMaps, {}).addTo(map);

  map.addLayer(openStreetMapLayer);
}

window.onload = initMap;

let hintButton = document.getElementById('hint-button');
let hintSection = document.getElementById('hint-section');

hintButton.addEventListener('click', function() {
  hintSection.classList.toggle('show-hint');
});
