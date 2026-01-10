import ClimateChangeIcon from "../components/Icons/ClimateChangeIcon";
import MapSearchIcon from "../components/Icons/MapSearchIcon";
import SatelliteIcon from "../components/Icons/SatelliteIcon";
import StormIcon from "../components/Icons/StormIcon";


export const exampleSearches = [
  {
    id: 1,
    label: "Explore datasets for WorldCereal collection",
    question: "Explore datasets for WorldCereal collection",
    icon: <SatelliteIcon width="1.5em" height="1.5em" />,
  },
  {
    id: 2,
    label: "Search for satellite dataset on land cover in South Africa",
    question: "Search for satellite dataset on land cover in South Africa",
    icon: <StormIcon width="1.5em" height="1.5em" />,
  },
  {
    id: 3,
    label: "Explore datasets for harmonized crop development in Europe",
    question: "Explore datasets for harmonized crop development in Europe",
    icon: <MapSearchIcon width="1.5em" height="1.5em" />,
  },
  {
    id: 4,
    label: "Discover datasets for phenology in Germany",
    question: "Discover datasets for phenology in Germany",
    icon: <ClimateChangeIcon width="1.5em" height="1.5em" />,
  },
];
