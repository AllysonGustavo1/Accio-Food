const fetch = require("node-fetch");
const { sleep } = require("./src/functions.js");
const token  = require("./src/env.js");

precoAlvo = "0.99"; // Preco do produto que está procurando. Valor é com ponto e não vírgula. Apenas para valor promocional.
latitude = ""; // Latitude do endereço
longitude = ""; // Longitude do endereço
limiteDeLojas = 100; // Limite de lojas que vão ser carregadas
espera = 200; // Tempo de espera entre as requisições (ms)

const url = `https://marketplace.ifood.com.br/v2/home?latitude=${latitude}&longitude=${longitude}&channel=IFOOD&size=${limiteDeLojas}&deliveryFeeMax=0&alias=HOME_MULTICATEGORY`;

const headers = {
  accept: "application/json, text/plain, */*",
  "accept-language": "pt-BR,pt;q=1",
  app_version: "9.103.5",
  browser: "Windows",
  "cache-control": "no-cache, no-store",
  "content-type": "application/json",
  country: "BR",
  platform: "Desktop",
  priority: "u=1, i",
  "sec-ch-ua":
    '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  test_merchants: "undefined",
  "x-device-model": "Windows Chrome",
  Referer: "https://www.ifood.com.br/",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const body = JSON.stringify({
  "supported-headers": ["OPERATION_HEADER"],
  "supported-cards": [
    "MERCHANT_LIST",
    "CATALOG_ITEM_LIST",
    "CATALOG_ITEM_LIST_V2",
    "CATALOG_ITEM_LIST_V3",
    "FEATURED_MERCHANT_LIST",
    "CATALOG_ITEM_CAROUSEL",
    "CATALOG_ITEM_CAROUSEL_V2",
    "CATALOG_ITEM_CAROUSEL_V3",
    "BIG_BANNER_CAROUSEL",
    "IMAGE_BANNER",
    "MERCHANT_LIST_WITH_ITEMS_CAROUSEL",
    "SMALL_BANNER_CAROUSEL",
    "NEXT_CONTENT",
    "MERCHANT_CAROUSEL",
    "MERCHANT_TILE_CAROUSEL",
    "SIMPLE_MERCHANT_CAROUSEL",
    "INFO_CARD",
    "MERCHANT_LIST_V2",
    "ROUND_IMAGE_CAROUSEL",
    "BANNER_GRID",
    "MEDIUM_IMAGE_BANNER",
    "MEDIUM_BANNER_CAROUSEL",
    "RELATED_SEARCH_CAROUSEL",
    "ADS_BANNER",
  ],
  "supported-actions": [
    "catalog-item",
    "merchant",
    "page",
    "card-content",
    "last-restaurants",
    "webmiddleware",
    "reorder",
    "search",
    "groceries",
    "home-tab",
  ],
  "feed-feature-name": "",
  "faster-overrides": "",
});

fetch(url, {
  method: "POST",
  headers: headers,
  body: body,
})
  .then((response) => response.json())
  .then(async (data) => {
    const lojas = data.sections[1].cards[0].data.contents;
    for (var x = 0; x < lojas.length; x++) {
      await sleep(espera);
      (function (x) {
        //console.log('Não encontrado nessa loja, procurando na próxima...')
        let id = lojas[x].id;
        let url = `https://marketplace.ifood.com.br/v1/merchants/${id}/catalog?latitude=${latitude}&longitude=${longitude}`;

        let headers = {
          "accept": "application/json, text/plain, */*",
          "accept-language": "pt-BR,pt;q=1",
          "app_version": "9.103.5",
          "authorization": `${token}`,
          "browser": "Windows",
          "cache-control": "no-cache, no-store",
          "platform": "Desktop",
          "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "Referer": "https://www.ifood.com.br/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        };
        fetch(url, {
          method: "GET",
          headers: headers,
          body: null,
        })
          .then((response) => response.json())
          .then((data) => {
            try {
              const catalogo = data.data.menu;
              for (var i = 0; i < catalogo.length; i++) {
                catalogo2 = catalogo[i].itens;
                for (var j = 0; j < catalogo2.length; j++) {
                  if (catalogo2[j].promotionalPrice == precoAlvo) {
                    console.log(
                      `Encontrei uma loja com um produto de ${precoAlvo}:`,
                      lojas[x].name
                    );
                  }
                }
              }
            } catch (error) {
              if (error instanceof TypeError) {
                if (
                  error.message ===
                  "Cannot read properties of undefined (reading 'menu')"
                ) {
                  console.error("IP ou Bearer Token bloqueado");
                  process.exit(1);
                } else {
                  console.error(
                    "Erro não registrado: ",
                    error.message
                  );
                }
              } else {
                throw error;
              }
            }
          });
      })(x);
    }
  })
  .catch((error) => console.error("Error:", error));