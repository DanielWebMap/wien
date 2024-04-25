/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
  lat: 48.208493,
  lng: 16.373118,
  title: "Stephansdom",
};

// Karte initialisieren
let map = L.map("map").setView([stephansdom.lat, stephansdom.lng], 12);

// BasemapAT Layer mit Leaflet provider plugin als startLayer Variable
let startLayer = L.tileLayer.provider("BasemapAT.grau");
startLayer.addTo(map);

let themaLayer = {
  sights: L.featureGroup().addTo(map),
  lines: L.featureGroup().addTo(map),
  stops: L.featureGroup().addTo(map),
  zones: L.featureGroup().addTo(map),
  hotels: L.featureGroup().addTo(map),
}

// Hintergrundlayer
L.control
  .layers({
    "BasemapAT Grau": startLayer,
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay"),
    "BasemapAT OpenTopoMap": L.tileLayer.provider("OpenTopoMap")
  }, {
    "Sehenswürdigkeiten": themaLayer.sights,
    "Sightseeing Linien": themaLayer.lines,
    "Bushaltestellen": themaLayer.stops,
    "Fußgängerzonen": themaLayer.zones,
    "Hotels": themaLayer.hotels
  })
  .addTo(map);

/* Marker Stephansdom
L.marker([stephansdom.lat, stephansdom.lng])
  .addTo(map)
  .bindPopup(stephansdom.title)
  .openPopup();
  */

// Maßstab
L.control
  .scale({
    imperial: false,
  })
  .addTo(map);

L.control.fullscreen().addTo(map);

// function addiere(zahl1, zahl2) {
//   let summe = zahl1 + zahl2;
//   console.log("Summe: ", summe)
// }

// addiere(4, 7);

//aufwendige Funktion!! Hier werden Daten von Server abgegriffen 
//Aufruf Sightseeing
async function loadSights(url) {
  // console.log("loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  // console.log(geojson);

  L.geoJSON(geojson, {

    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: 'icons/photo.png',
          iconAnchor: [16, 37],
          popupAnchor: [0, -37]
        })
      });
    },
    onEachFeature: function (feature, layer) {
      //console.log(feature);
      //console.log(feature.properties.NAME);
      layer.bindPopup(`
      <img src="${feature.properties.THUMBNAIL}" alt="*">
      <h4><a href="${feature.properties.WEITERE_INF}" target="wien">${feature.properties.NAME}</a></h4>
        <address>${feature.properties.ADRESSE}</address>
        `)
    }
  }).addTo(themaLayer.sights);
}
loadSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json");

//Aufruf Liniennetz

async function loadLines(url) {
  // console.log("loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  // console.log(geojson);
  L.geoJSON(geojson, {
    onEachFeature: function (feature, layer) {
      //console.log(feature);
      //console.log(feature.properties.LINE_NAME);
      layer.bindPopup(`
      <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4>
      <i class="fa-regular fa-circle-stop"></i> ${feature.properties.FROM_NAME}<br>
      <i class="fa-solid fa-down-long"></i><br> 
      <i class="fa-regular fa-circle-stop"></i> ${feature.properties.TO_NAME}
      `)
    },

    //Linienfarbe anpassen nach Titel der Linien 
    /*style: function (feature) {
      return { color: `${feature.properties.LINE_NAME.split(' ')[0]}`, width: 4 };  //NAME Wird eingelesen, Mit Funktion Split alledings nur erstes Wort der Zeichenkette (getrennt durch Leerzeichen)
    }*/

    //Lienienfarbe anpassen unabhängig von Attribut mit IF-Anwendung
    style: function (feature) {
      let lineName = feature.properties.LINE_NAME;
      let lineColor = "black";
      if (lineName == "Red Line") {
        lineColor = "#FF4136"
      }
      else if (lineName == "Yellow Line") {
        lineColor = "#FFDC00"
      }
      else if (lineName == "Blue Line") {
        lineColor = "#0074D9"
      }
      else if (lineName == "Green Line") {
        lineColor = "#2ECC40"
      }
      else if (lineName == "Orange Line") {
        lineColor = "#FF851B"
      }
      else if (lineName == "Grey Line") {
        lineColor = "#AAAAAA "
      }
      else {
        //Vielleicht kommen noch andere Linien dazu...
      }
      return { color: lineColor, };
    }

  }).addTo(themaLayer.lines);
}
loadLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");




async function loadStops(url) {
  // console.log("loading", url);
  let response = await fetch(url);
  let geojson = await response.json();

  // console.log(geojson);
  L.geoJSON(geojson, {
    onEachFeature: function (feature, layer) {
      //console.log(feature);
      //console.log(feature.properties);
      layer.bindPopup(`
      <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4> 
      ${feature.properties.STAT_NAME}
        `)
    },
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: `icons/bus_${feature.properties.LINE_ID}.png`,
          iconAnchor: [16, 37],
          popupAnchor: [0, -37]
        })
      });
    }

  }).addTo(themaLayer.stops);
}
loadStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json");


//Aufruf Fußgängerzonen

async function loadzones(url) {
  // console.log("loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  // console.log(geojson);
  L.geoJSON(geojson, {
    style: function (feature) {
      return {
        color: "#F012BE",
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.1,
      };
    },
    onEachFeature: function (feature, layer) {
      //console.log(feature);
      //console.log(feature.properties);
      layer.bindPopup(
        `<h4>Fussgängerzone ${feature.properties.ADRESSE}</h4>
        <i class="fa-regular fa-clock"></i> ${feature.properties.ZEITRAUM || "dauerhaft"} <br><br>
        <i class="fa-solid fa-circle-info"></i> ${feature.properties.AUSN_TEXT || "ohne Außnahme"}
        `

      )
    }
  }).addTo(themaLayer.zones);
}
loadzones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");


//Aufruf Hotels

async function loadhotels(url) {
  // console.log("loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  // console.log(geojson);
  L.geoJSON(geojson, {
    pointToLayer: function (feature, latlng) {
      let iconKategorie = feature.properties.KATEGORIE_TXT;
      let iconName;
      if (iconKategorie == "1*") {
        iconName = "hotel_1star"
      }
      else if (iconKategorie == "2*") {
        iconName = "hotel_2stars"
      }
      else if (iconKategorie == "3*") {
        iconName = "hotel_3stars"
      }
      else if (iconKategorie == "4*") {
        iconName = "hotel_4stars"
      }
      else if (iconKategorie == "5*") {
        iconName = "hotel_5stars"
      }
      else if (iconKategorie == "nicht kategorisiert") {
        iconName = "hotel_0star"
      }
      else {
        //Vielleicht kommen noch andere Kategorien dazu...
        iconName = "hotel_0star"
      }
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: `icons/${iconName}.png`,
          iconAnchor: [16, 37],
          popupAnchor: [0, -37]
        })
      });
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties);
      layer.bindPopup(`
      
      <h3>${feature.properties.BETRIEB}</h3>
      <h4>${feature.properties.BETRIEBSART_TXT} ${feature.properties.KATEGORIE_TXT}</h4> 
      <hr>
        Addr.: ${feature.properties.ADRESSE}<br>
        Tel.: <a href="tel:${feature.properties.KONTAKT_TEL}" alt="*">${feature.properties.KONTAKT_TEL}</a><br>
        E-Mail: <a href="mailto:${feature.properties.KONTAKT_EMAIL}" alt="*">${feature.properties.KONTAKT_EMAIL}</a><br>
        <a href="${feature.properties.WEBLINK1}" alt="*">Homepage</a>
        `)
    }
  }).addTo(themaLayer.hotels);
}
loadhotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json");



//<hr> Querstrich