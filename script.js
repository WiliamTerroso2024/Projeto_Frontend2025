// Configurações do sistema
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI1ZWNmZGJiYTUwNTQ0ODQ3YTRjMGFkMWExNWQxOGMzMSIsImlhdCI6MTczNzkzNDU5NCwiZXhwIjoyMDUzMjk0NTk0fQ.01ixOHFnurgg9DamYpigCMlHW3ESgNYTTLHKURjrhDw";
const urlDeviceTracker = "http://206.42.5.159:8123/api/states/device_tracker.2312dra50g"; // URL para dados do dispositivo
const urlGeocodedLocation = "http://206.42.5.159:8123/api/states/sensor.2312dra50g_geocoded_location"; // URL para endereço completo

// Elementos da interface
const addressElement = document.getElementById("device-address"); // Elemento para mostrar o endereço
const batteryElement = document.getElementById("device-battery"); // Elemento para mostrar a porcentagem da bateria

// Variáveis globais para mapa e marcador
let map;
let marker;

// Função para inicializar o mapa
function initializeMap(latitude, longitude) {
    console.log("Inicializando mapa com as coordenadas:", latitude, longitude);
    map = L.map('map').setView([latitude, longitude], 13);

    // Adiciona o tileLayer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Cria o marcador no mapa
    marker = L.marker([latitude, longitude]).addTo(map);
}

// Função para buscar localização, endereço e status da bateria do dispositivo
async function fetchDeviceData() {
    try {
        console.log("Iniciando a requisição para obter dados do dispositivo...");

        // Requisição para obter latitude, longitude e nível da bateria
        const responseDevice = await fetch(urlDeviceTracker, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!responseDevice.ok) {
            throw new Error("Erro ao obter os dados do dispositivo.");
        }

        const deviceData = await responseDevice.json();
        console.log("Dados do dispositivo recebidos:", deviceData);

        const latitude = deviceData.attributes.latitude;
        const longitude = deviceData.attributes.longitude;
        const batteryLevel = deviceData.attributes.battery_level;

        if (!latitude || !longitude) {
            throw new Error("Coordenadas não encontradas no dispositivo.");
        }

        // Atualiza a porcentagem da bateria
        if (batteryLevel !== undefined) {
            batteryElement.textContent = `Bateria: ${batteryLevel}%`;
        } else {
            batteryElement.textContent = "Bateria: Informação indisponível.";
        }

        // Requisição para obter o endereço geocodificado completo
        const responseGeocoded = await fetch(urlGeocodedLocation, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!responseGeocoded.ok) {
            throw new Error("Erro ao obter o endereço geocodificado.");
        }

        const geocodedData = await responseGeocoded.json();
        console.log("Endereço geocodificado recebido:", geocodedData);

        const fullAddress = geocodedData.state || "Endereço não disponível.";
        addressElement.textContent = `Endereço completo: ${fullAddress}`;

        // Inicializa o mapa ou atualiza o marcador
        if (!map) {
            initializeMap(latitude, longitude);
        } else {
            marker.setLatLng([latitude, longitude]);
            map.setView([latitude, longitude], 13);
        }
    } catch (error) {
        console.error("Erro ao carregar os dados do dispositivo:", error);
        addressElement.textContent = "Erro ao carregar o endereço do dispositivo.";
        batteryElement.textContent = "Erro ao carregar o status da bateria.";
    }
}

// Executa a função ao carregar a página
fetchDeviceData();
