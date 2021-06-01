// Credit to tutorial from Youtube
// This is their git:  https://github.com/CodingWith-Adam/covid19-map
// Made modifications on their custom legend

import LegendItem from "./LegendItem.js";

var legendItems = [
  new LegendItem(
    "Priority 5 (Highest Risk)",
    "rgba(202, 11, 0, 0.7)",
    // "#CA0B00",
    (cases) => cases >= 1_000_000,
  ),

  new LegendItem(
    "Priority 4 (High Risk)",
    // "FF4500",
    "rgba(255, 69, 0, 0.7)",
    (cases) => cases >= 500_000 && cases < 1_000_000,
  ),

  new LegendItem(
    "Priority 3 (Medium Risk)",
    // "#FFA500",
    "rgba(255, 165, 0, 0.7)",
    (cases) => cases >= 200_000 && cases < 500_000
  ),

  new LegendItem(
    "Priority 2 (Low Risk)",
    // "#FF5733",
    "rgba(255, 87, 51, 0.7)",
    (cases) => cases >= 50_000 && cases < 200_000
  ),

  new LegendItem(
    "Priority 1 (Lowest Risk)",
    // "#FFC300",
    "rgba(255, 195, 0, 0.7)",
    (cases) => cases > 0 && cases < 50_000
  ),

  new LegendItem("No Data", "rgba(0, 0, 0, 0.7)", (cases) => true, "white"),
];

export default legendItems;