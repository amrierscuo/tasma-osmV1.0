// main.js
/**
 * Toponymic Atlas of Sardinia and Military Areas
 *
 * This script enables users to upload and visualize GeoJSON files on a Leaflet map.
 * It provides functionality for layer control, property selection/filtering, searching, and popup display.

 ImportantEvent Listeners:
 1. File input 'change': Loads GeoJSON files and processes them.
 2. Property checkbox 'change': Updates the popup content based on the selected properties.
 3. Search box 'input': Filters features based on the search input.
 4. Remove GeoJSON button 'click': Clears the map and removes GeoJSON files.
 5. Hint button 'click': Toggles the visibility of the hint section.
 6. Checkbox 'change' (inside the search box event listener): Updates the popup content based on the selected properties.
 7. Checkbox 'change' (inside the loadGeoJSONFile function): Updates the popup content based on the selected properties.

*/

/**
 * Global Variables
 *
 * map: Leaflet map object
 * markers: Object to store marker clusters for each GeoJSON file
 * geoJsonData: Object to store the GeoJSON data for each file
 * propertyStatus: Object to track the status of each property checkbox
 * allLayers: Array to store all GeoJSON layers and features
 * selectedProperties: Object to store eventually selected properties for popup display
 */
let map;
let markers = {};
let geoJsonData = {};
let propertyStatus = {};
let allLayers = [];
let selectedProperties = {};

/**
 * Layer Names
 *
 * Names of the GeoJSON files to be loaded and displayed on the map
 */
let layerNames = ['atlante_toponomastico.geojson', 'AreeSpecialiMilitari.geojson'];

/**
 * Initialize the Leaflet map
 */
function initMap() {
  map = L.map('map').setView([40.1209, 9.0129], 8);

  // Define the tile layers using various tile providers

  // OpenStreetMap tile layer
  let openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  });

  // Mapbox Satellite tile layer
  let satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.PUTYOURTOKEN',
  });

  let mapboxStreetsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.PUTYOURTOKEN',
  });

  let mapboxSatelliteStreetsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.PUTYOURTOKEN',
  });

  let mapboxOutdoorsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3lzZ2hvc3Q5OSIsImEiOiJjbGl1OHJ4MWowMG5sM21zNmY0dTZqdm15In0.iBd4rB6y3hFJlJ4GHSv0HQ', {
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.PUTYOURTOKEN',
  });

  // Add the tile layers to the map
  let baseMaps = {
    'OpenStreetMap': openStreetMapLayer,
    'Satellite': satelliteLayer,
    'Mapbox Streets': mapboxStreetsLayer,
    'Mapbox Satellite Streets': mapboxSatelliteStreetsLayer,
    'Mapbox Outdoors': mapboxOutdoorsLayer
  };
  openStreetMapLayer.addTo(map);

  // Disable the search box initially
  let searchBox = document.getElementById('search-box');
  searchBox.disabled = true;
  searchBox.style.backgroundColor = '#ddd';

  /**
   * Update the popup content based on the selected properties(This is crucial for popup content)
   * @param {object} feature - GeoJSON feature
   * @param {object} layer - Leaflet layer
   */
  function updatePopupContent(feature, layer) {
    let popupContent = '';
    for (let property in feature.properties) {
      let checkbox = document.getElementById(property);
      console.log('Checkbox:', checkbox);
      if (checkbox && checkbox.checked) {
        popupContent += property.toUpperCase() + ': ' + feature.properties[property] + '<br>';
      }
    }
    layer.bindPopup(popupContent);
    console.log('Updated popup content:', popupContent);
  }

  /**
   * Event listener for file input change
   * Loads GeoJSON files and processes them
   */
  document.getElementById('geojson-file').addEventListener('change', function() {
    let files = this.files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if (layerNames.includes(file.name)) {
        loadGeoJSONFile(file);
      }
    }
  });

  /**
   * Load GeoJSON file
   * @param {File} file - GeoJSON file
   */
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
                  updatePopupContent(obj.feature, obj.layer);                 // notice update Pop up!
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

          console.log('Popup content:', popupContent);
          markers[file.name].addLayer(layer);
          layer.bindPopup(popupContent);
          console.log('Popup content after update:', popupContent);
        }
      });
      map.addLayer(markers[file.name]);

      // Enable the search box
      searchBox.disabled = false;
      searchBox.style.backgroundColor = '#fff';

      // add a layer control checkbox for this file
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

  /**
   * Event listener for search box input
   * Filters features based on search input
   */
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
                      updatePopupContent(obj.feature, obj.layer);                   // notice update Pop up!
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

            console.log('Popup content:', popupContent);
            markers[fileName].addLayer(layer);
            layer.bindPopup(popupContent);
            console.log('Popup content after update:', popupContent);
          }
        });
        map.addLayer(markers[fileName]);
      }
    }
  });

  /**
   * Event listener for remove GeoJSON button
   * Clears the map and removes GeoJSON files
   */
  document.getElementById('remove-geojson').addEventListener('click', function() {
    for (let fileName in markers) {
      if (markers[fileName]) {
        markers[fileName].clearLayers();
        markers[fileName] = null;
        delete geoJsonData[fileName];

        // remove the corresponding layer control checkbox
        let checkbox = document.getElementById('layer-control-' + fileName);
        checkbox.parentNode.removeChild(checkbox);
        let label = document.querySelector('label[for="layer-control-' + fileName + '"]');
        label.parentNode.removeChild(label);
        // reset the property panel as well when removing the GeoJSON
        let propertySelectPanel = document.getElementById('property-checkboxes');
        propertySelectPanel.innerHTML = '';
      }
    }

    // Disable the search box
    searchBox.disabled = true;
    searchBox.style.backgroundColor = '#ddd';

    location.reload();
  });

  // Add layer control
  let layerControl = L.control.layers(baseMaps, {}).addTo(map);

  // Set default layer as OpenStreetMap
  map.addLayer(openStreetMapLayer);
}

// Execute the initMap function when the window loads
window.onload = initMap;

/**
 * Event listener for the hint button
 * Toggles the visibility of the hint section
 */
let hintButton = document.getElementById('hint-button');
let hintSection = document.getElementById('hint-section');

hintButton.addEventListener('click', function() {
  hintSection.classList.toggle('show-hint');
});
