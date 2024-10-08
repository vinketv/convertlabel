function detectTransporter(text) {
  if (text.includes("USER")) {
    return "mondialRelay";
  } else if (text.includes("UPS")) {
    return "ups";
  } else if (text.includes("Chronopost")) {
    return "chronopost";
  } else if (text.includes("Colissimo")) {
    return "colissimo";
  } else if (text.includes("Vinted Go")) {
    return "vinted";
  } else if (
    text.includes("l'ensemble de vos articles dans un seul et unique carton.")
  ) {
    return "relais";
  } else {
    return "unknown";
  }
}
