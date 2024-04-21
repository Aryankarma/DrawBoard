import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
 url: "http://localhost:8080/",
 realm: "firstRealm",
 clientId: "whiteboardApp",
});

export default keycloak;