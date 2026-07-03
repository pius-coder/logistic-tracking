export type JourneyTransportType = "MARITIME" | "AERIEN";
export type JourneyStatus =
  | "BROUILLON"
  | "PLANIFIE"
  | "EN_COURS"
  | "EN_PAUSE"
  | "PROBLEME"
  | "TERMINE"
  | "ANNULE";

export type JourneyStopType = "DEPART" | "ESCALE" | "DESTINATION";
export type JourneySpeedUnit = "KNOTS" | "KMH";

export type JourneyStopDto = {
  id: string;
  placeName: string;
  placeLabel: string | null;
  mapboxPlaceId: string | null;
  latitude: number;
  longitude: number;
  stopType: JourneyStopType;
  sequence: number;
  estimatedArrivalAt: string | null;
  reachedAt: string | null;
  note: string | null;
};

export type JourneyEventDto = {
  id: string;
  eventType: string;
  title: string;
  message: string;
  createdAt: string;
};

export type JourneyDto = {
  id: string;
  requestId: string;
  requestNumber: string;
  publicToken: string;
  customerName: string;
  recipientName: string;
  recipientPhone: string;
  transportMode: "AVION" | "BATEAU";
  productDescription: string;
  packageWeightKg: number | null;
  packageCount: number;
  originCountry: { id: string; name: string; iso2: string } | null;
  destinationCountry: { id: string; name: string; iso2: string } | null;
  vehicleName: string;
  transportType: JourneyTransportType;
  status: JourneyStatus;
  averageSpeed: number | null;
  speedUnit: JourneySpeedUnit | null;
  publishedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  latestMessage: string | null;
  problemMessage: string | null;
  updatedAt: string;
  stops: JourneyStopDto[];
  events: JourneyEventDto[];
};

export type JourneyGeocodingResult = {
  id: string;
  name: string;
  label: string;
  latitude: number;
  longitude: number;
};
