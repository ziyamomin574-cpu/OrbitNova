import { SatelliteNode } from '../types';

export const MASTER_APPS_SCRIPT_URL = "";

export const INITIAL_SEED_SATELLITES: SatelliteNode[] = [
  {
    id: 10,
    satelliteId: "SAT-0010",
    collegeName: "RIT Polytechnic Lohegaon (Pune)",
    studentName: "Eshan Godambe",
    principalName: "Dr. Shashikant Pawar",
    location: "Lohegaon, Pune, Maharashtra",
    weatherCondition: "Telemetry Connected",
    aqi: 35,
    temperature: 26.5,
    humidity: 61.2,
    pressure: 948.5,
    windSpeed: 10.5,
    lat: 18.5808,
    lng: 73.9189,
    googleMapsUrl: "https://maps.google.com/?q=18.5808,73.9189",
    batteryLevel: 98,
    rssi: -58,
    orbitAltitude: 485,
    isLiveStream: true,
    lastPing: "Live Feed Active",
    url: "",
    childWebsiteUrl: "",
    sourceType: "standard",
    isCustom: true
  }
];

export function generateFullSeedDataset(): SatelliteNode[] {
  return [...INITIAL_SEED_SATELLITES];
}
