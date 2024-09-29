export default interface ISSAPIResponse {
  altitude: number;
  daynum: number;
  footprint: number;
  id: number;
  latitude: number;
  longitude: number;
  name: "iss";
  solar_lat: number;
  solar_lon: number;
  timestamp: number;
  units: "kilometers";
  velocity: number;
  visibility: string;
}