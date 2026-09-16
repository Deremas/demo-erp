import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, StockMovementType } from "../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the shop stock seed script.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const SOURCE_TYPE = "OPENING_STOCK_SEED";
const SOURCE_ID = "bole-sabon-shala-summit-bisrate-stock-2026-05-02";
const MOVEMENT_DATE = new Date("2026-05-02T00:00:00.000Z");
const FALLBACK_UNIT_NAME = "Pcs";

type ShopStockSeedRow = {
  locationCode: string;
  shopName: string;
  sku: string;
  name: string;
  unitName: string;
  categoryName: string;
  qtyOnHand: number;
};

const STOCK_SEED_SOURCE = [
  {
    shopName: "Sabon",
    locationCode: "SABON",
    workbook: "Sabon.xlsx",
    sheetName: "Sheet",
    rows: 359
  },
  {
    shopName: "Bisrate Gabriel",
    locationCode: "BISRATE-GABRIEL",
    workbook: "Bisrate Gabriel.xlsx",
    sheetName: "Sheet",
    rows: 256
  },
  {
    shopName: "Bole",
    locationCode: "BOLE",
    workbook: "Bole.xlsx",
    sheetName: "Sheet",
    rows: 498
  },
  {
    shopName: "Summit",
    locationCode: "SUMMIT",
    workbook: "Summit.xlsx",
    sheetName: "Sheet",
    rows: 221
  },
  {
    shopName: "Shala",
    locationCode: "SHALA",
    workbook: "Shala.xlsx",
    sheetName: "Sheet",
    rows: 251
  }
] as const;

const STOCK_SEED_ROWS: ShopStockSeedRow[] = [
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "850014275099",
    name: "CLASE AZUL REPOSADO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314302467",
    name: "THE MACALLAN RARE CASK BLACK 2023 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009605834304",
    name: "CAPE AUCTION RESERVE CLASSIC WHITE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009605834311",
    name: "CAPE AUCTION RESERVE CLASSIC ROSE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009605834205",
    name: "CAPE AUCTION RESERVE CLASSIC RED 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002269004670",
    name: "TANGLED TREE TROPICAL SAU BLANC 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002269004687",
    name: "TANGLED TREE SPICY SHIRAZ 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002269004663",
    name: "TANGLED TREE CAB SAUVIGNON 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009605839002",
    name: "BEACON HILL SAUVIGNON BLANC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009705030767",
    name: "BAYEDE ROYAL PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002269006254",
    name: "CAPE AUCTION RESERVE CABERNET SAUVIGNON 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 28
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009802168042",
    name: "BAYEDE THE KING JUBILEE CABERNET SAUVIGNON MERLOT 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002269004274",
    name: "THE COFFEE POT PINOTAGE 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009705030743",
    name: "BAYEDE ROYAL CHENIN BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002269006247",
    name: "CAPE AUCTION RESERVE COLOMBAR 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 26
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "LQ-00041",
    name: "Chateau de Camarsac 2018 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "LQ-00039",
    name: "Armand De Brignac Brut Gold",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "LQ-00013",
    name: "Ast.Fervo Refrontolo Passito 50 cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "LQ-00011",
    name: "CH.Lynch-Moussas 1996 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 22
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "LQ-000046",
    name: "IDDA ETNA ROSSO 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "LQ-000045",
    name: "GAJA BRUNELLO DI MONTALCINO PIEVE SANTA RESTITUTA 2018",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "LQ-0000044",
    name: "CH. LA CROIX DU CASSE 2018 POMEROL 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "IT-00001-19",
    name: "Test Item",
    unitName: "Pcs",
    categoryName: "Test",
    qtyOnHand: 42
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9798890741974",
    name: "CASTEL CUV PRE CABERNET MALBEC DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 32
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592951721",
    name: "DA VINCHI GOURMET MANGO FRUIT 1LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592849554",
    name: "DA VINCHI GOURMET CHEESE CAKE FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592710076",
    name: "DAVINCHI GOURMET PECAN PARLINE SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592624724",
    name: "DAVINCHI GOURMET MAJESTICS MANGO SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 19
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592584905",
    name: "DA VINCHI GOURMET SALTED CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592584608",
    name: "DA VINCHI GOURMET CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592580174",
    name: "DAVINCHI GOURMET WATERMELON WONDER SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 109
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592530575",
    name: "DAVINCHI GOURMET PUMP 15M-0.53",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592529128",
    name: "DAVINCHI GOURMET EUROPEAN STRAWBERRY SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 99
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513615",
    name: "DA VINCHI GOURMET VANILLA SYRUP",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 50
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513585",
    name: "DA VINCHI GOURMET HAZELNUT SYRUP",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 27
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513578",
    name: "DA VINCHI GOURMET CARAMEL SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513530",
    name: "DA VINCHI GOURMET CHOCOLATE FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513516",
    name: "DA VINCHI GOURMET BUTTERSCOTCH FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513226",
    name: "DA VINCHI GOURMET MADAGASCAR VANILLA BEAN FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513172",
    name: "DA VINCHI GOURMET BLUE OCEAN SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 14
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592513165",
    name: "DA VINCHI GOURMET GRENADINE POMEGRANATE SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592168198",
    name: "DAVINCHI GOURMET PUMPKIN SPICE SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592166811",
    name: "DAVINCHI GOURMET COCONUT SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592129205",
    name: "DAVINCHI GOURMET POMELO GRAPEFRUIT SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 71
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592122039",
    name: "DA VINCHI GOURMET ROSE SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592024784",
    name: "DA VINCHI GOURMET MIXED BERRY FRUIT 1LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9556592000016",
    name: "DAVINCHI GOURMET FRAPPEASE POWDER 1.15 KG",
    unitName: "Pcs",
    categoryName: "Snacks",
    qtyOnHand: 17
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9551021070073",
    name: "DAVINCHI GOURMET LEMON TEA SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9506000024493",
    name: "castel Rift Valley Cuvee Prestige Cha 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 57
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9506000024479",
    name: "Acacia Medium Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 68
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9506000024455",
    name: "Acacia Medium Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 64
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9506000024417",
    name: "Rift Valley Cabernet Sauvignon 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 50
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "950600002441",
    name: "Rift Vally Dry Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9506000024400",
    name: "Rift Valley Sirah 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9319020005591",
    name: "WHISTLING DUCK 2023 CHARDONNAY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9319020005577",
    name: "WHISTLING DUCK 2024 SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9312088005428",
    name: "WOLF BLASS BLACK LABEL CAB SAUV SHIRAZ MALBEC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311789563466",
    name: "OXFORD LANDING MERLOT 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311789279596",
    name: "OXFORD LANDING CAB SAU SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 26
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311220005005",
    name: "19 CRIMES SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311043066047",
    name: "BANROCK STATION SAU BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311043049217",
    name: "HARDY'S CABERNET MERLOT 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311043024511",
    name: "HARDY'S CHARDONNAY SEMILLON 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311043015038",
    name: "HARDY'S THE RIDDLE SAUV BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9311043014901",
    name: "HARDY'S THE RIDDLE CAB MERLOT 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9310297029754",
    name: "PENFOLDS ST. HENRI SHIRAZ 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9310297021772",
    name: "PENFOLDS R.W.T BIN 798 SHIRAZ BAROSSA VALLEY 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 20
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9310297010905",
    name: "PENFOLDS KOONUNGA HILL SHIRAZ CABERNET 2019",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 19
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9310297004928",
    name: "PENFOLDS FATHER GRAND TAWNY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9300770065720",
    name: "WOLF BLASS EAGLEHAWK MERLOT 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9300770043551",
    name: "WOLF BLASS EAGLEHAWK CAB SAUVIGNON 2019 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9300727513007",
    name: "JACOB'S CREEK CAB SAUVIGNON 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9300727017635",
    name: "JACOB'S CREEK DOUBLE BARREL SHIRAZ VINTAGE 2017 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9300727009418",
    name: "JACOB'S CREEK CLASSIC PINOT NOIR 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 27
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "9300727003997",
    name: "JACOB'S CREE CLASSIC PINOT GRIGIO WHITE 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "90162602",
    name: "Red Bull Energy Drink 250ml",
    unitName: "Pcs",
    categoryName: "ENERGIZER",
    qtyOnHand: 878
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "88076161870",
    name: "Ciroc Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 49
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8716000966353",
    name: "BOLS AMSTERDAM BUTTERSCOTCH 70 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8716000964717",
    name: "Bols Parfait Amour 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "87000006935",
    name: "Capitan Morgan Black 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 28
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "860001753417",
    name: "KOMOS ANEJO CRISTALINO TEQUILA 75CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "856724006206",
    name: "CASAMIGOS REPOSADO GOLD 100 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 37
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "856724006107",
    name: "Casamigos Tequila Sliver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 51
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8411640000480",
    name: "GIN MARE 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8410162100111",
    name: "FUNDADOR SHERRY CASK FINE BRANDY 100 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "836206002391",
    name: "CHOCOHOLIC PINOTAGE 2022 75CL 86",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "836206001240",
    name: "DARLING CELLARS OLD BUSH VINES BLANC 19 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "836206001226",
    name: "DARLING CELLARS OLD BUSH VINES CINSAUT 2019 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "836206000724",
    name: "SIR CHARLES DARLING VITTGE 2020 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 28
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "82184090442",
    name: "Jack Danel No.7 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 71
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "80480280017",
    name: "Grey Goose Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 66
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8043240043",
    name: "Chivas Regal 12years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 61
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663105048",
    name: "FANTINEL EXTRA DRY PROSECCO 75 CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 46
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663101088",
    name: "fantinel ROCCIAPONCA Pinot Grigio 2020 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 34
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663101071",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C JUDRI SAUVIGNON 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663088679",
    name: "FANTINEL CUV PRESTIGE BRUT 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663088570",
    name: "FANTINEL SAUVIGNON BORGA FESIS WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663088518",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C VENKO RED BLEND 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663088037",
    name: "FANTINEL ONE AND ONLY ROSE BRUT 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8009663085302",
    name: "FANTINEL PINOT GRIGIO BORGA FESES 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8008900005394",
    name: "TERRE AFFEGRE TREBBIANO 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8008900005387",
    name: "TERRE AFFEGRE SANGIOVESE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829985325",
    name: "BOTTEGA STAR EXTRA DRY 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "80058299831780",
    name: "BOTTEGA LL VINO DELL'AMORE PETALO MOSCATO 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829982355",
    name: "Bottega Pinot Grigio Delle Venezie 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829981655",
    name: "Bottega Blanco 75cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829981617",
    name: "Bottega Collio Doc Pinot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829980733",
    name: "Bottega Gold & Rose 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 17
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829980719",
    name: "Bottega Gold,Rose,Black & Gold 11&vol 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829980269",
    name: "Bottega Prosecco Stardust 1.5L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829978204",
    name: "Bottega Brunello Di Montalcino Riserva 2013 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829233334",
    name: "Bottega Gold 3lL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829232337",
    name: "Bottega Gold 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829230531",
    name: "Bottega Valpolicella Classico 2021 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829230524",
    name: "Bottega Amarone Della Valpolicella Classico 2016 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 41
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829230388",
    name: "Bottega Rose Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 41
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829230043",
    name: "Bottega Prosecco 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 14
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829222055",
    name: "PRONOL SAMBUCA 70 CL *6",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005829033156",
    name: "Bottega Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8005713114053",
    name: "Romana Black 75cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8004747009441",
    name: "ANTICA SAMBUCA CLASSIC 100 CL",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 19
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8004747007508",
    name: "Antica Sambuca Banana 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8004747007461",
    name: "Antica Sambuca With Liquorice Flavour 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8004747006754",
    name: "Antica Sambuca Raspberry 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8004747006730",
    name: "Antica Sambuca Coffee 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8004400001003",
    name: "Fernet Branca 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 31
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8003905043952",
    name: "Grappa Prosecco 70CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8003905043822",
    name: "Ast. Tiramisu 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8003905042016",
    name: "Ast. Casadiletta 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8003905040517",
    name: "Ast. Fashion Victim Cuvee 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8003405007485",
    name: "Roberto Cavali Rosemary 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8002230000012",
    name: "Aperol 1919 1l",
    unitName: "Pcs",
    categoryName: "APERITIF",
    qtyOnHand: 43
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8000570484004",
    name: "Martini Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: -1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8000040500081",
    name: "Wild Turkey 101 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "8000040500036",
    name: "WILD TURKEY 101 BOURBON WHISKEY 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7804320303178",
    name: "CASILLERO DEL DIABLO CABERNET SAUIGNON 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7804320087016",
    name: "CASILLERO DEL DIABLO CARMENERE 2021 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7798130465594",
    name: "ANDES SOUL ARGENTO MALBEC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7790975003931",
    name: "TERRAZAS DELOS ANDES MALBEC 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7640171037363",
    name: "DEWAR'S AGED 15 YEARS DOUBLE AGED 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7610113007495",
    name: "BACARDI SPICED 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7610113001455",
    name: "BACARDI ANEJO CUATRO AGED 4 YEARS 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "753604062195",
    name: "OPUS ONE 2019",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7506064300344",
    name: "Donjulio 1942",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 16
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7503023842433",
    name: "VOLCAN DI MI TIERRA REPOSADO 70 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7501035042315",
    name: "Jose Curvo Silver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 70
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7501012916127",
    name: "Camino Silver 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 68
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7501012914611",
    name: "Camino Gold 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 48
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "7312040017034",
    name: "Absolute Blue 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 72
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "725765058508",
    name: "Rift Valley Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 25
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "721733005857",
    name: "PATRON EL ALTO DE AGAVE 75CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6947882211428",
    name: "LAO XUV ZHAIG",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6938514100715",
    name: "JIANGXIAOBAI 40 DEGREES 100ML",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6909131169201",
    name: "XIAO JIU",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 25
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6906785230868",
    name: "RED STAR ERGUOTOU 500 ML",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6902952880294",
    name: "Moutai Kwichow 50cl",
    unitName: "Pcs",
    categoryName: "MOUTAI",
    qtyOnHand: 47
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6901798120854",
    name: "LUZHOU LAOJIAO TOUQU 500ML",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "674545000858",
    name: "Donjuulio Resposado 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 232
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "674545000841",
    name: "Donjulio Blanco 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 18
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "619947000013",
    name: "Tito's Vodka 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009811000852",
    name: "CHARLES LANG & SONS CABERNET SAU RUBY CABERNET 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009802168332",
    name: "Bayede The Prince Merlot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 27
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009801167039",
    name: "KANONKOP KADETTE CAPE BLEND 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009663800686",
    name: "Diemersfontein Harkequin Shiraz Pinotage 2020 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009663800259",
    name: "Thokozani Shiraz 2019",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009650562030",
    name: "FISH HOEK CHENIN BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009650561996",
    name: "FISH HOEK PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009615620560",
    name: "DARLING CELLARS MERLOT 2020 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009615620546",
    name: "DARLING CELLARS SHIRAZ 2020 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "60096025478877",
    name: "ANTICA DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 48
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "60096025478633",
    name: "ANTICA DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 33
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6009602547863",
    name: "Antica Natural Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 51
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6003643009991",
    name: "CHARLES LANG & SONS SAUVIGNON BLANC 75CL NON VINTAGE",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6003643009977",
    name: "CHARLES LANG & SONS MERLOT 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6003643009953",
    name: "CHARLES LANG & SONS CABERNET SAUVIGNON 2024",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6003643009892",
    name: "CHARLES LANG & SONS PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6003643009878",
    name: "CHARLES LANG & SONS SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002123103006",
    name: "SIMONSIG STARTING BLOCKS CHENIN BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 39
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6002039007665",
    name: "THE CHOCOLATE BLOCK 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6001495062669",
    name: "Amarula cream 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 54
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6001452371506",
    name: "NEDERBURG SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6001452325899",
    name: "NEDEREBURG CHARDONNAY 75CL *12",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6001452301862",
    name: "NEDERBURG CABERNET SAUVIGNON 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6001452272896",
    name: "STEIN CHENIN BLANC 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "6001108028709",
    name: "Two Oceans Shiraz Rose 75Cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 34
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5901041003362",
    name: "BELVEDERE 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 44
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5604575000479",
    name: "CABRIZ RESERVA 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5601012011500",
    name: "MATEUS THE ORIGINAL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5410316518536",
    name: "Smirnoff Vodka Red 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 113
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5410316442930",
    name: "Smirnoff Red No.21 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 41
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5099873006368",
    name: "Jack Daniels Jennessee Fire 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060294565376",
    name: "Indian Summer 70cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 25
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060294564188",
    name: "Blackbull 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060294560951",
    name: "Smokin 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 11
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060165353729",
    name: "Blackbull 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 21
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060103020065",
    name: "U'LUVKA VODKA 175CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060045581594",
    name: "Aftershock Red 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060045581570",
    name: "Aftershock Blue 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060030081252",
    name: "MASIA J TEMPRANILLO 2023 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5060030081238",
    name: "MASIA J MERLOT 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5055807400596",
    name: "THE BOTANIST ISLAY DRY GIN 22 70CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5016840000617",
    name: "HIGH COMMISSIONER BLENDED SCOTCH WHISKY 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5011166082781",
    name: "WHITLEY NEILL GIN DISTILLER'S CUT DRY GIN 100CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5011013100118",
    name: "Baileys Irish Cream 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 23
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5011007025083",
    name: "JAMESON BLACK BARREL 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5011007003227",
    name: "Jamson Irish Whisky 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 77
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010677935005",
    name: "Martini Extra Dry 100cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 16
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010677716000",
    name: "Bombay Sapphire 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 30
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010677025812",
    name: "Bacardi Gold 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 16
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010677015738",
    name: "Bacardi White 100Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 59
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010494560121",
    name: "Glenmorangie Age 10 Yeras 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010391101007",
    name: "Drambuie 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327703053",
    name: "Hendriks Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 63
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327604008",
    name: "THE BALVENIE AGED 21 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327603056",
    name: "Monkey Shoulder 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 31
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327505138",
    name: "The Balvenie 12 yr 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327363219",
    name: "Glenfiddich 15yrs 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 66
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327325606",
    name: "Glenfiddich IPA 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327325323",
    name: "Glenfiddich 18yrs 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 53
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327324081",
    name: "Glenfidich 21 Year 70 Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327305585",
    name: "Glenfiddich Fire & Cane 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 15
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327302201",
    name: "Glenfiddich 12y 100 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 21
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010327000497",
    name: "Grants Triple Wood 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 52
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314570101",
    name: "Highland Park 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314313944",
    name: "THE MACALLAN A NIGHT ON EARTH 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314312411",
    name: "THE MACALLAN 12 YEARS OLD COLOUR COLLECTION",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314305130",
    name: "THE MACALLAN ENIGMA 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314305109",
    name: "The Macallan Single MALT QUEST 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 31
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314302863",
    name: "THE MACALLAN 12Y OLD DOUBLE CASK 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314301712",
    name: "THE MACALLAN RARE CASK 2023 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314101015",
    name: "The Famous Grouse",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 39
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010314005108",
    name: "Highland Park 18 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010278100727",
    name: "JIM BEAM APPLE 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010134916684",
    name: "Kumala Pinotage 2018",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010134916677",
    name: "KUMALA SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010134916080",
    name: "Anakena Reserva Malbec 2020 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010134912310",
    name: "MUD HOUSE NEW ZEALAND SAU BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010103940184",
    name: "ROE & CO IRISH WHISKEY 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 26
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010103800457",
    name: "J & B Whisky 1L*12",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 41
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010093210007",
    name: "Teacher's Highland Cream 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 34
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5010019640260",
    name: "LAPHROAIG AGED 10 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "500281016535",
    name: "Clynelish 14 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000329002278",
    name: "BEEFEATER DRY GIN 100 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 23
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000299618042",
    name: "Beefeater Pink Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 20
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000299255049",
    name: "Chivas Regal 18Yrs 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 23
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000299225028",
    name: "Chivas Regal 18Yrs 75Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 14
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000299223055",
    name: "Capitan Morgan Gold 100 Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 37
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000299211243",
    name: "Royal Salute 21Yrs 70Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000291020805",
    name: "Tanquery L dry GIN 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 53
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000289929981",
    name: "Gordon Gin Pink 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000289020800",
    name: "Gordon Gin 100Cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 274
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281058337",
    name: "Casamigos Tequila Gold 70cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281051413",
    name: "THE SINGLETON SiNGLE MALT 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 48
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281033631",
    name: "Talisker Drak Storm 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281019390",
    name: "CAOL ILA AGE 12 YEARS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281016283",
    name: "CAOL ILA AGED 12 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281005423",
    name: "Dalwhinnie 15 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281005409",
    name: "Lagavulin 16 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281003641",
    name: "Talisker Single Malt 10 years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000281002897",
    name: "Cragganmore 12 years 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000277005123",
    name: "DEWAR'S AGED 18 YEARS DOUBEL AGED 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267182360",
    name: "J/w Gold Label 200 Limited Edition 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 31
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267165844",
    name: "J/W 18 Year Aged 1L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 59
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267134321",
    name: "J/W Green Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 62
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267129150",
    name: "J/W & SONS X.R AGED 21 YEARS 75 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267117584",
    name: "J/W Gold Label Reserve 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 203
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267114293",
    name: "J/W Blue Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 50
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267106151",
    name: "J/W& Sons King George 75 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267112077",
    name: "J/W Double Black 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 118
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267024400",
    name: "J/W Black Lable 50Cl Glass",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 42
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267023625",
    name: "J/W Black Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 241
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "5000267013626",
    name: "J/W Red Label 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 56
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4901777020313",
    name: "THE YAMAZAKI AGED 12 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 19
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4840771004700",
    name: "Petrovskaia Chocolate 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4840771003420",
    name: "Petrovskaia Platinum 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4840771003376",
    name: "PETROVSKAIA CHERRY 100 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4840771002874",
    name: "Petrovskaia 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 18
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4750021003905",
    name: "Stoli Gold 70cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4750021002724",
    name: "Stolichnaya Premium 37cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 33
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4750021000829",
    name: "ELIT EIGHTEN 1.75",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4750021000805",
    name: "Stolichinaya Elit 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4750021000164",
    name: "Stolichnaya Premium 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 85
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4750021000157",
    name: "Stolichnaya Premium 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 173
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4750021000133",
    name: "Stolichnaya Premium 50cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 79
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4740050004967",
    name: "CRAFTER'S AROMATIC FLOWER GIN 70 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4650054792497",
    name: "Winter Palace 100 Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4067700013002",
    name: "Jagermeister SEB 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 152
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "4004752321006",
    name: "Danzka The Spirit Vodka 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3890000781125",
    name: "BELUGA NOBLE VODKA EXPORT 3 LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3890000781095",
    name: "BELUGA NOBLE VODKA EXPORT 1LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3770002495049",
    name: "CH. PEYROULEY BORDEAUX 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3760091712936",
    name: "CH LAMARSALLI MONTAGNE 19 AND 20 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3760068130220",
    name: "CH. CAMOLONG SAINTE LEONIE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3701273700068",
    name: "Folie Rouge Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 38
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3700597302347",
    name: "Nikka Super rare old 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3666140026804",
    name: "WHISPERING ANGEL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 20
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3484542839200",
    name: "CH. BAS VIN DE PROVENCE RED 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3430560010923",
    name: "FAIM DE LOUP SYRAH 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3391180020610",
    name: "M. CHAPOUTIER PETITE RUCHE 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3391180019317",
    name: "M. CHAPOUTIER BELLEIUCHE 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3270049122026",
    name: "JEAN DES VIGNES WHITE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3262151254757",
    name: "Baron Philippe De Rothschilid Bordeaux 2018 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3253950000522",
    name: "Champagne Demoiselle Vranken Brut",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3249990047344",
    name: "LIONS DE BATAILLEY PAUILLAC 2018 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3249990043872",
    name: "CH. LES CHEMINS DE LA CROIX DU CASSE 2018 POMEROL 2018 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3249990034771",
    name: "CH. GRAND DOUSPRAT 2018 50CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3249990034184",
    name: "Chateau De Domaine De L'eglise 2016 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3249990030797",
    name: "CH. HAUT-BAGES MONPELOU PAUILLAC 2015 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3249990018580",
    name: "Chateau Trotte Vieille 2013 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 21
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3249990009960",
    name: "Chapelle De La Trinite 1.5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3245999865019",
    name: "HENNESSY X.O KIM JONES LIMITED 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3245996126311",
    name: "Hennessy Paradise Rare Cognac 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3245995960015",
    name: "Hennessy VS 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 61
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3245990001218",
    name: "Hennessy Xo Extra Old 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 49
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3219820000078",
    name: "Martell VS 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3211209289647",
    name: "Very Passion Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3185370564721",
    name: "Dom Perignon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3185370457054",
    name: "Moet & Chandon Ice lmperial 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 49
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3185370074831",
    name: "Moet & Chandon Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3185370068441",
    name: "Moet & Chandon Nectar 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 19
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3185370000335",
    name: "Moet & Chandon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 82
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3162049400573",
    name: "Teresa Castillo Blanco 70cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3159560603811",
    name: "CALVERT SAUVIGNON BLANC 75CL 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3132590089602",
    name: "Pastis Jean Canon 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 17
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3119460005603",
    name: "LA JAJA DE JAU SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3119460003272",
    name: "JAU WHITE SPARKLING 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3052911148415",
    name: "Emo Triple Sec Curaca38% 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3052911097522",
    name: "Emo Coconut 20% 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3052910000301",
    name: "Emo Apricot Brandy 20% 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3049197800083",
    name: "COURVOISIER X.O 100CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3049197210790",
    name: "Courvoiser V.S.O.P 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 13
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3049197210196",
    name: "COURVOISIER VSOP FINE CHAMPANGNE 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 2
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3049197110106",
    name: "Courvoiser V.S.100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 3
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3047100090309",
    name: "Pernod Paris 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 24
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3043700104002",
    name: "Mumm Champagne Demi Sec 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 7
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3035542004206",
    name: "Cointreau 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 18
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3035542001908",
    name: "Cointreau 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 19
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3024482295126",
    name: "Remy Martin Vsop 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 26
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3024482270123",
    name: "Remy Martin Vsop 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 33
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3024482270109",
    name: "REMY MARTIN FINE CHAMPAGNE V.S.O.P COGNAC 70CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3024480004522",
    name: "Remy Martin Xo 70Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3024480002191",
    name: "Louls XIII de Remy Martin",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3012993059504",
    name: "SIR EDWARDS'S SMOKY BLENDED SCPTCH WHISKY 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3012993046313-",
    name: "LONGCHAMPS CHARDONNAY 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 40
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "3012993046276",
    name: "LONGCHAMPS MERLOT 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 34
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "30021662",
    name: "Remy Martin VSOP 5cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 48
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "088544018941",
    name: "Southern Comfort 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "086003091931",
    name: "ROBERT MONDAVI PINOT NOIR PRIVATE SELECTION 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "080686813019",
    name: "Laphroaig 10 Years 75cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "080686007913",
    name: "HIBIKI SUNTORY WHISKY JAPANESE 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: -1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "080432108512",
    name: "AVION RESERVA 44 EXTRA ANEJO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "080432107249",
    name: "OLMECA DARK CHOCOLATE 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 32
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "0659525318758",
    name: "CONFIDENCE COLA SWEET RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "0659525318741",
    name: "CONFIDENCE CLASSIC SMOTH RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "0659525318734",
    name: "CONFIDENCE CANDY SWEET ROSE 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 36
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "0659525318727",
    name: "CONFIDENCE HONEY SWEET WHITE 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "041038000013",
    name: "DOUBLE DUTCH VODKA 75 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 20
  },
  {
    locationCode: "SABON",
    shopName: "Sabon",
    sku: "002123338002",
    name: "SIMONSIG STARTING BLOCKS CAB SAUV SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009605834311",
    name: "CAPE AUCTION RESERVE CLASSIC ROSE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009605834205",
    name: "CAPE AUCTION RESERVE CLASSIC RED 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6002269004670",
    name: "TANGLED TREE TROPICAL SAU BLANC 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6002269004694",
    name: "TANGLED TREE BUTTERSCOTCH CHARDONNAY 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6002269004687",
    name: "TANGLED TREE SPICY SHIRAZ 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009605839002",
    name: "BEACON HILL SAUVIGNON BLANC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009705030767",
    name: "BAYEDE ROYAL PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009705031450",
    name: "BAYEDE ROYAL NATURAL SWEET RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6002269006254",
    name: "CAPE AUCTION RESERVE CABERNET SAUVIGNON 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009802168042",
    name: "BAYEDE THE KING JUBILEE CABERNET SAUVIGNON MERLOT 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "J-000001",
    name: "J/W X.R AGED 21 YEARS",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281016467",
    name: "GLEN ELGIN AGED 12 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592553592",
    name: "DA VINCHI STRAWBERRY SYRUP75 CL",
    unitName: "Pcs",
    categoryName: "Syrup",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6902952894024",
    name: "MOUTAI KWEICHOW 50CL",
    unitName: "Pcs",
    categoryName: "MOUTAI",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "LQ-00039",
    name: "Armand De Brignac Brut Gold",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "LQ-00013",
    name: "Ast.Fervo Refrontolo Passito 50 cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "LQ-00011",
    name: "CH.Lynch-Moussas 1996 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "LQ-000046",
    name: "IDDA ETNA ROSSO 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "LQ-00001",
    name: "AST. Croder Rosso 75 Cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "IT-00001-19",
    name: "Test Item",
    unitName: "Pcs",
    categoryName: "Test",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9798890741974",
    name: "CASTEL CUV PRE CABERNET MALBEC DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 43
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592951721",
    name: "DA VINCHI GOURMET MANGO FRUIT 1LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592949766",
    name: "DA VINCHI GOURMET PASSIONFRUIT MIX 1LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592624724",
    name: "DAVINCHI GOURMET MAJESTICS MANGO SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592584905",
    name: "DA VINCHI GOURMET SALTED CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592584608",
    name: "DA VINCHI GOURMET CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592530575",
    name: "DAVINCHI GOURMET PUMP 15M-0.53",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 8
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592529128",
    name: "DAVINCHI GOURMET EUROPEAN STRAWBERRY SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592513530",
    name: "DA VINCHI GOURMET CHOCOLATE FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592513196",
    name: "DA VINCHI GOURMET MENTA CUBANO SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 8
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592513165",
    name: "DA VINCHI GOURMET GRENADINE POMEGRANATE SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592166811",
    name: "DAVINCHI GOURMET COCONUT SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9556592000016",
    name: "DAVINCHI GOURMET FRAPPEASE POWDER 1.15 KG",
    unitName: "Pcs",
    categoryName: "Snacks",
    qtyOnHand: 8
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9506000142616",
    name: "CASTEL RIFT VALLEY CHENIN BLANC DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9506000024493",
    name: "castel Rift Valley Cuvee Prestige Cha 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9506000024479",
    name: "Acacia Medium Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 69
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9506000024455",
    name: "Acacia Medium Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 50
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9506000024417",
    name: "Rift Valley Cabernet Sauvignon 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 63
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "950600002441",
    name: "Rift Vally Dry Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9506000024400",
    name: "Rift Valley Sirah 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 56
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9418408030016",
    name: "CLOUDY BAY SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9319020005591",
    name: "WHISTLING DUCK 2023 CHARDONNAY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9319020005577",
    name: "WHISTLING DUCK 2024 SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311789563466",
    name: "OXFORD LANDING MERLOT 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311789279596",
    name: "OXFORD LANDING CAB SAU SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311220005005",
    name: "19 CRIMES SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043066047",
    name: "BANROCK STATION SAU BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 26
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043049217",
    name: "HARDY'S CABERNET MERLOT 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043027390",
    name: "HARDY'S NATTAGE HILL SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043024511",
    name: "HARDY'S CHARDONNAY SEMILLON 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043015403",
    name: "HARDY'S THE RIDDLE CHARDONNAY 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043015038",
    name: "HARDY'S THE RIDDLE SAUV BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043014901",
    name: "HARDY'S THE RIDDLE CAB MERLOT 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "9311043000225",
    name: "HARDY'S NATTAGE HILL CAB SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "90162602",
    name: "Red Bull Energy Drink 250ml",
    unitName: "Pcs",
    categoryName: "ENERGIZER",
    qtyOnHand: 362
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "88076161870",
    name: "Ciroc Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 15
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "87000006935",
    name: "Capitan Morgan Black 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "856724006206",
    name: "CASAMIGOS REPOSADO GOLD 100 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 22
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "856724006107",
    name: "Casamigos Tequila Sliver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 16
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8437008960388",
    name: "Premium Gin Gold 999.9",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8411640000480",
    name: "GIN MARE 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "836206002391",
    name: "CHOCOHOLIC PINOTAGE 2022 75CL 86",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "836206001240",
    name: "DARLING CELLARS OLD BUSH VINES BLANC 19 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "82184090442",
    name: "Jack Danel No.7 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 67
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "80480280017",
    name: "Grey Goose Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 69
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8043240043",
    name: "Chivas Regal 12years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 40
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8009663101088",
    name: "fantinel ROCCIAPONCA Pinot Grigio 2020 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8009663101071",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C JUDRI SAUVIGNON 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8009663089102",
    name: "FANTINEL ONE AND ONLY PROSECCO BRUT",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8009663088570",
    name: "FANTINEL SAUVIGNON BORGA FESIS WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8009663088518",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C VENKO RED BLEND 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8009663085302",
    name: "FANTINEL PINOT GRIGIO BORGA FESES 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8009663085289",
    name: "FANTINEL CAB SAUVIGNON BORGA FESES 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8008900005387",
    name: "TERRE AFFEGRE SANGIOVESE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829989200",
    name: "Bottega White 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829986230",
    name: "Bottega Prosecco D.O.C Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829982355",
    name: "Bottega Pinot Grigio Delle Venezie 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829981617",
    name: "Bottega Collio Doc Pinot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829980269",
    name: "Bottega Prosecco Stardust 1.5L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829980153",
    name: "Bottega Prosecco Stardust 3L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829979362",
    name: "Bottega Rose Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829978204",
    name: "Bottega Brunello Di Montalcino Riserva 2013 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829232337",
    name: "Bottega Gold 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 21
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829230388",
    name: "Bottega Rose Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829230043",
    name: "Bottega Prosecco 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 23
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829222055",
    name: "PRONOL SAMBUCA 70 CL *6",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 8
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8005829033156",
    name: "Bottega Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8004747009441",
    name: "ANTICA SAMBUCA CLASSIC 100 CL",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8004747007461",
    name: "Antica Sambuca With Liquorice Flavour 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8004747006730",
    name: "Antica Sambuca Coffee 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8004400001003",
    name: "Fernet Branca 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 48
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8003905042351",
    name: "Ast. Corderie 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8003905042016",
    name: "Ast. Casadiletta 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8003905040517",
    name: "Ast. Fashion Victim Cuvee 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8002230000012",
    name: "Aperol 1919 1l",
    unitName: "Pcs",
    categoryName: "APERITIF",
    qtyOnHand: 22
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8000160686375",
    name: "TERESA RIZZI PROSECCO BRUT 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "8000040500081",
    name: "Wild Turkey 101 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7804320510170",
    name: "CASILLERO DEL DIABLO SHIRAZ 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7804320303178",
    name: "CASILLERO DEL DIABLO CABERNET SAUIGNON 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7804320256900",
    name: "CASILLERO DEL DIABLO CHARDONNAY 2023 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7804320087016",
    name: "CASILLERO DEL DIABLO CARMENERE 2021 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7798130466515",
    name: "ANDES SOUL ARGENTO SYRAH 2023",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 20
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7798130465594",
    name: "ANDES SOUL ARGENTO MALBEC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7790975003986",
    name: "TERRAZAS DE LOS ANDES CHARDONNAY 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7610113007495",
    name: "BACARDI SPICED 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7610113001455",
    name: "BACARDI ANEJO CUATRO AGED 4 YEARS 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7501035042315",
    name: "Jose Curvo Silver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 32
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7501035010093",
    name: "Jose Cuervo Gold 100Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 21
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7501012916127",
    name: "Camino Silver 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 69
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7501012914611",
    name: "Camino Gold 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 18
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "7312040017034",
    name: "Absolute Blue 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 44
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "725765058508",
    name: "Rift Valley Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 33
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "721733000036",
    name: "Patron Cafe Xo 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "674545000865",
    name: "DONJULIO ANEJO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "674545000858",
    name: "Donjuulio Resposado 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 39
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "674545000841",
    name: "Donjulio Blanco 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 13
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "619947000013",
    name: "Tito's Vodka 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009811000852",
    name: "CHARLES LANG & SONS CABERNET SAU RUBY CABERNET 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009650561996",
    name: "FISH HOEK PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009615621734",
    name: "DARLING CELLARS CHENIN BLANC 2025 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009602547900",
    name: "Antica Natural Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "60096025478877",
    name: "ANTICA DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 27
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "60096025478633",
    name: "ANTICA DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 56
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6009602547863",
    name: "Antica Natural Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6003643009991",
    name: "CHARLES LANG & SONS SAUVIGNON BLANC 75CL NON VINTAGE",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 19
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6003643009977",
    name: "CHARLES LANG & SONS MERLOT 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6003643009892",
    name: "CHARLES LANG & SONS PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6003643009878",
    name: "CHARLES LANG & SONS SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6002123103006",
    name: "SIMONSIG STARTING BLOCKS CHENIN BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6002039007665",
    name: "THE CHOCOLATE BLOCK 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6001495062669",
    name: "Amarula cream 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 49
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6001452371506",
    name: "NEDERBURG SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6001452325899",
    name: "NEDEREBURG CHARDONNAY 75CL *12",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "6001452303873",
    name: "Nederburg Pinotage 2022075 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5901041003362",
    name: "BELVEDERE 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5604575000479",
    name: "CABRIZ RESERVA 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5601012011500",
    name: "MATEUS THE ORIGINAL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5410316518536",
    name: "Smirnoff Vodka Red 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 90
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5410316442930",
    name: "Smirnoff Red No.21 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 73
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5060294565376",
    name: "Indian Summer 70cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5060294564188",
    name: "Blackbull 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5060294560951",
    name: "Smokin 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5060165353729",
    name: "Blackbull 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5060030081252",
    name: "MASIA J TEMPRANILLO 2023 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5060030081238",
    name: "MASIA J MERLOT 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5060030081214",
    name: "MASIA J SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5013626111222",
    name: "taylor's fine tawny port 75 cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5011013100118",
    name: "Baileys Irish Cream 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 39
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5011007003227",
    name: "Jamson Irish Whisky 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 31
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010677935005",
    name: "Martini Extra Dry 100cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 8
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010677716000",
    name: "Bombay Sapphire 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 28
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010677025812",
    name: "Bacardi Gold 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010677015738",
    name: "Bacardi White 100Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 38
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010494560121",
    name: "Glenmorangie Age 10 Yeras 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010391101007",
    name: "Drambuie 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327703053",
    name: "Hendriks Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 40
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327604008",
    name: "THE BALVENIE AGED 21 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327603056",
    name: "Monkey Shoulder 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 37
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327363219",
    name: "Glenfiddich 15yrs 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 44
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327325323",
    name: "Glenfiddich 18yrs 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 45
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327324081",
    name: "Glenfidich 21 Year 70 Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327305585",
    name: "Glenfiddich Fire & Cane 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327302201",
    name: "Glenfiddich 12y 100 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 31
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010327000497",
    name: "Grants Triple Wood 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 37
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010314101015",
    name: "The Famous Grouse",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010278100727",
    name: "JIM BEAM APPLE 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010134916707",
    name: "KUMALA CHARDONNAY2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010134916677",
    name: "KUMALA SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010134912310",
    name: "MUD HOUSE NEW ZEALAND SAU BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010103940184",
    name: "ROE & CO IRISH WHISKEY 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 16
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010103927956",
    name: "Khockando 15 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010103800457",
    name: "J & B Whisky 1L*12",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 23
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5010093210007",
    name: "Teacher's Highland Cream 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "500281016535",
    name: "Clynelish 14 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000329002322",
    name: "Beefater Gin 100Cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000329002278",
    name: "BEEFEATER DRY GIN 100 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 24
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000299618042",
    name: "Beefeater Pink Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 14
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000299255049",
    name: "Chivas Regal 18Yrs 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 53
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000299223055",
    name: "Capitan Morgan Gold 100 Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 22
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000291020805",
    name: "Tanquery L dry GIN 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 44
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000289929981",
    name: "Gordon Gin Pink 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 17
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000289020800",
    name: "Gordon Gin 100Cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 282
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281066998",
    name: "Lagavulin Aged 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281050171",
    name: "The Singleton 12 Years Old 75cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 18
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281041094",
    name: "Dalwhinnie Winter's Gold 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281033631",
    name: "Talisker Drak Storm 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281019390",
    name: "CAOL ILA AGE 12 YEARS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281005423",
    name: "Dalwhinnie 15 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281005409",
    name: "Lagavulin 16 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000281003641",
    name: "Talisker Single Malt 10 years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267182360",
    name: "J/w Gold Label 200 Limited Edition 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267165844",
    name: "J/W 18 Year Aged 1L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267134321",
    name: "J/W Green Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 18
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267117584",
    name: "J/W Gold Label Reserve 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 86
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267114293",
    name: "J/W Blue Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 29
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267106151",
    name: "J/W& Sons King George 75 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267112077",
    name: "J/W Double Black 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 98
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267091006",
    name: "J/w Swing Blended Scotch Whisky 75cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267024400",
    name: "J/W Black Lable 50Cl Glass",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 15
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267023625",
    name: "J/W Black Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 299
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "5000267013626",
    name: "J/W Red Label 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 83
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4901777020313",
    name: "THE YAMAZAKI AGED 12 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4750021003905",
    name: "Stoli Gold 70cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 22
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4750021002724",
    name: "Stolichnaya Premium 37cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 46
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4750021000805",
    name: "Stolichinaya Elit 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4750021000164",
    name: "Stolichnaya Premium 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 68
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4750021000157",
    name: "Stolichnaya Premium 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 82
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4750021000133",
    name: "Stolichnaya Premium 50cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 57
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "42213277",
    name: "MONKEY 47 SCHWARZWALD DRY GIN 500 ML",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "4067700013002",
    name: "Jagermeister SEB 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 99
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3890000781095",
    name: "BELUGA NOBLE VODKA EXPORT 1LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3701273700068",
    name: "Folie Rouge Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3701273700020",
    name: "CH. LA GAMAYE BLAYE COTES 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3700597302347",
    name: "Nikka Super rare old 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3666140026804",
    name: "WHISPERING ANGEL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3484542839200",
    name: "CH. BAS VIN DE PROVENCE RED 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3484541829226",
    name: "CH. BAS VIN DE PROVENCE ROSE 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3451210230300",
    name: "CH. L'ESCART EDEN 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3430560010923",
    name: "FAIM DE LOUP SYRAH 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3391180020610",
    name: "M. CHAPOUTIER PETITE RUCHE 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3333950101006",
    name: "Champagne Henri Moreau Brut",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 15
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3324651371010",
    name: "LAMOTHE PARROT SIGNATURE MEDIUM SWEET BLANC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3270040009906",
    name: "JEAN DES VIGNES RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3245996126311",
    name: "Hennessy Paradise Rare Cognac 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3245995960015",
    name: "Hennessy VS 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 13
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3245990987611",
    name: "Hennessy VSOP 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3245990001218",
    name: "Hennessy Xo Extra Old 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3219820000078",
    name: "Martell VS 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3219820000054",
    name: "Martell Congnac Vs 1le",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3185370564721",
    name: "Dom Perignon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 6
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3185370457054",
    name: "Moet & Chandon Ice lmperial 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3185370074831",
    name: "Moet & Chandon Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 24
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3185370068441",
    name: "Moet & Chandon Nectar 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3185370000335",
    name: "Moet & Chandon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3162049400573",
    name: "Teresa Castillo Blanco 70cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3147690059103",
    name: "Gibson's Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 5
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3147690025702",
    name: "LABEL 5 BLENDED WHISKY 1LIT",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3052911148415",
    name: "Emo Triple Sec Curaca38% 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3047100090309",
    name: "Pernod Paris 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3043700104002",
    name: "Mumm Champagne Demi Sec 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 13
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3035542004206",
    name: "Cointreau 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3035542001908",
    name: "Cointreau 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3024482295126",
    name: "Remy Martin Vsop 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3024482270123",
    name: "Remy Martin Vsop 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 9
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3024480006472",
    name: "Remy Martin Xo 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 4
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3012993059504",
    name: "SIR EDWARDS'S SMOKY BLENDED SCPTCH WHISKY 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 11
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3012993046351",
    name: "LONGCHAMPS CABERNET SAUVIGNON",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3012993038899",
    name: "LAMOTHE PARROT ORIGINAL CLASSIC RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "3012993035249",
    name: "CH. Molin De Brion Medoc 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "080432107249",
    name: "OLMECA DARK CHOCOLATE 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 13
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "0659525318758",
    name: "CONFIDENCE COLA SWEET RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "0659525318741",
    name: "CONFIDENCE CLASSIC SMOTH RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "041038000020",
    name: "DOUBLE DUTCH VODKA 5 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 51
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "041038000013",
    name: "DOUBLE DUTCH VODKA 75 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 35
  },
  {
    locationCode: "BISRATE-GABRIEL",
    shopName: "Bisrate Gabriel",
    sku: "002123338002",
    name: "SIMONSIG STARTING BLOCKS CAB SAUV SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3269555851780",
    name: "MAISON GAUTIER 1755 EXTRA 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281003603",
    name: "DALWHINNIE 15 YEARS 1 LIT",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8410310622717",
    name: "CASTILLO DE LIRIA BLANC DE BLANCS BRUT 75 CL",
    unitName: "Pcs",
    categoryName: "Champage",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "KR-00006",
    name: "KERRY ORANGE JUCY FLAVOUR 20 LIT",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: 99
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "KR-00005",
    name: "KERRY CAPPUCCINO FLAVOUR 20 LIT",
    unitName: "Kg",
    categoryName: "flavour",
    qtyOnHand: 100
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "KR-00004",
    name: "KERRY MIXED FRUIT FLAVOUR 20LIT",
    unitName: "Kg",
    categoryName: "flavour",
    qtyOnHand: 100
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "KR-00003",
    name: "KERRY PEPPERMINTFLAVOUR 20LIT",
    unitName: "Kg",
    categoryName: "flavour",
    qtyOnHand: 100
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "KR-00002",
    name: "KERRY STRAWBERRY FLAVOUR 20LIT",
    unitName: "Kg",
    categoryName: "flavour",
    qtyOnHand: 100
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "KR-00001",
    name: "KERRY BANANA FLAVOR 20 LITER",
    unitName: "Kg",
    categoryName: "flavour",
    qtyOnHand: 100
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "KL-000003",
    name: "KLASSICS MARATHON GIN & TONIC 330 ML",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 43
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "IT-00002-SB02",
    name: "KLASSICS MARATHON BLENDED WHISKY & COLA 330 ML",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 47
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "kl-000001",
    name: "KLASSICS MARATHON VODKA & LIME 330 ML",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 46
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "IT-00001-SB02",
    name: "BUTLERS DRUMSHANBO GUNPOWDER IRISH GIN MILK CHOCOLATE TRUFFLES 300 G",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7610403072547",
    name: "GOLDKENN AMARULA SWISS CHOCOLATE LIQUOR NET WT 100 G 3.5",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: -10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5774540990057",
    name: "ANTHON BERG BLUEBERRY IN VODKA CHOCOLATE COVERED MARZIPAN NET 220 G 8 PIECES",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5774540984056",
    name: "ANTHON BERG STRAWBERRY IN SPARKLING WINE CHOCOLATE COVERED MARZIPAN NET 220 G 8 PIECES",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5774540825700",
    name: "ANTHON BERG 16 CHOCOLATE COCKTAILS BOTTLES NET WT 250G",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "762571500043",
    name: "FREEZ MIX LEMON & GINGER 275 ML",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "762571500128",
    name: "FREEZ MIX LEMON & MINT 275 ML",
    unitName: "Pcs",
    categoryName: "flavour",
    qtyOnHand: -3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "RUN-00002",
    name: "RAS TEJ 100 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "RUN-00001",
    name: "RAS TEJ 25 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000176307",
    name: "RUNGO ROASTERS 500 G",
    unitName: "Pcs",
    categoryName: "Snacks",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269004328",
    name: "FIVE'S RESERVE CAB SAUV 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "AR-00003",
    name: "ARADA APPLE 330ML",
    unitName: "Pcs",
    categoryName: "BEER",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "AR-00002",
    name: "ARADA PINEAPPLE 330ML",
    unitName: "Pcs",
    categoryName: "BEER",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "AR-00001",
    name: "ARADA LIME 330ML",
    unitName: "Pcs",
    categoryName: "BEER",
    qtyOnHand: 26
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "01801828",
    name: "BUDWEISER KING OF BEERS 473ML",
    unitName: "Pcs",
    categoryName: "BEER",
    qtyOnHand: 130
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "75032814",
    name: "CORONA EXTRA 355 ML",
    unitName: "Pcs",
    categoryName: "BEER",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQ-0088",
    name: "NATIONAL BARO'S DRY GIN",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQ-00078",
    name: "NATIONAL OUZO 100 CL",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990052416",
    name: "LES CHEMINS DE LA CROIX DU CASSE POMEROL 2020",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4969265725485",
    name: "AKASHI WHISKY CRAFTED BY TOJI 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "19589303109",
    name: "818 TEQUILA REPOSADO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4973373500247",
    name: "YAMAZAKURA FINE BLENDED 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4901777286177",
    name: "THE CHITA SINGLE GRAIN JAPANESE WHISKY 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4901777303553",
    name: "TOKI SUNTORY WHISKY 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5056294900194",
    name: "MARATHON GIN 75 C;L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 20
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5056294900200",
    name: "MARATHON VODKA 75 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 31
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "40677057",
    name: "JAGERMEISTER 20ML",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 328
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010494992205",
    name: "GLENMORANGIE SINGLE MALT 12 YEARS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 48
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990049270",
    name: "ch. du domaine de l'eglise pomerol 2020",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990052672",
    name: "CH. HAUT - VIGNOBLE SEGUIN 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990029845",
    name: "DUROI RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "32499900146229",
    name: "FONCROSE RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990013059",
    name: "CUVEE BORIE MANOUX BLANC 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 36
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249996061467",
    name: "CUVEE BORIE MANOUX RED 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760093990011",
    name: "POUILLY FUME 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990029869",
    name: "DUROI BORDEAUX SAV BLANC AND SEMILLON 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3484541819234",
    name: "CH. BAS VIN DE BLANC",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760072977996",
    name: "CH.PEYRABON HAUT - MEDOC 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "850014275099",
    name: "CLASE AZUL REPOSADO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 40
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267192888",
    name: "J/W BLUE LABEL ELUSIVE UMAMI 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281040912",
    name: "CAPTAIN MORGAN WHITE RUM 100 CL",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314310936",
    name: "THE MACALLAN {M} BLACK RELEASE HIGHLAND SINGLE MALT 70",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010494564273",
    name: "GLENMORANGIE AGED 18 YEARS THE INFINITA 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "812400495474",
    name: "CLASE AZUL PLATA 70 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5013967019935",
    name: "JURA SINGLE MALT ISLANDERS' EXPRESSIONS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010494983890",
    name: "GLENMORANGIE THE NECTAR AGED 16 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3028130076488",
    name: "CAMUS VERY SPECIAL 100 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3028130078918",
    name: "CAMUS XO 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "853134008028",
    name: "BANDERO BLANCO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8000040630535",
    name: "GLEN GRANT ROTHES CHRONICLES CASK HAWEN 100 CL BOURBON AND SHERRY CASK",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267190372",
    name: "CARDHU SING MALT AGED 16 YEARS SPECIAL RELEASE 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010494508307",
    name: "GLEN MORAY ELGIN CLASSIC SPEYSIDE SINGLE MALT 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3269555814969",
    name: "GAUTIER PINARDEL RIO XO 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299637128",
    name: "ROYAL SALUTE THE MIAMI POLO EDITION 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314310929",
    name: "THE MACALLAN {M} ANNUAL RELEASE HIGHLAND SINGLE MALT 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5013967014633",
    name: "JURA SINGLE MALT AGED 10 YEARS WITH GLASS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "721733005512",
    name: "PATRON ANEJO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 31
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3500610135743",
    name: "JP. CHENET PINOT NOIR ROSE DEMI- SEC 75 CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010719187003",
    name: "THE MACALLAN 18 YEARS SHERY OAK COLLECTION 70 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080432402504",
    name: "CHIVAS 12 YEARS 50 ML",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 51
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "50002670255775",
    name: "BLACK LABEL 50ML",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 88
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "764017571713249",
    name: "GREY GOOSE VODKA 50ML",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 67
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314308469",
    name: "THE MACALLAN 15 YEARS OLD SHERRY SEASONED OAK CASK DOUBLE CASK COLLECTION 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314309862",
    name: "THE MACALLAN 18 YEARS SHERRY SEASONED OAK DOUBLE CASK 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314017408",
    name: "THE MACALLAN 12 YEARS SHERRY OAK COLLECTION 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 21
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4603928005865",
    name: "BELUGA NOBEL WITH GLASS 100 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8059306000223",
    name: "R0BERTO CAVALLI VODKA SILVER 100 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4901777126039",
    name: "THE YAMAZAKI SINGLE MALT AGED 18 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080686008149",
    name: "THE YAMAZAKI SINGL MALT ISLAY PEATED 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "08068600819",
    name: "THE YAMAZKI PEATED MALT KOGI SPANISH OAK 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080686008170",
    name: "THE YAMAZAKI SINGEL MALT GOLDEN PROMISE 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "811751020601",
    name: "STOLI ELIT 75 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010677945004",
    name: "MARTINI ROSATO 100 CL",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314302467",
    name: "THE MACALLAN RARE CASK BLACK 2023 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "60009705030187",
    name: "BAYEDE THE KING SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009605834304",
    name: "CAPE AUCTION RESERVE CLASSIC WHITE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009605834311",
    name: "CAPE AUCTION RESERVE CLASSIC ROSE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009605834205",
    name: "CAPE AUCTION RESERVE CLASSIC RED 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269004670",
    name: "TANGLED TREE TROPICAL SAU BLANC 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269004694",
    name: "TANGLED TREE BUTTERSCOTCH CHARDONNAY 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269004687",
    name: "TANGLED TREE SPICY SHIRAZ 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269004663",
    name: "TANGLED TREE CAB SAUVIGNON 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009605839002",
    name: "BEACON HILL SAUVIGNON BLANC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009705030767",
    name: "BAYEDE ROYAL PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 28
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009705031450",
    name: "BAYEDE ROYAL NATURAL SWEET RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 38
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269006254",
    name: "CAPE AUCTION RESERVE CABERNET SAUVIGNON 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009802168042",
    name: "BAYEDE THE KING JUBILEE CABERNET SAUVIGNON MERLOT 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 27
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269004274",
    name: "THE COFFEE POT PINOTAGE 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 29
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009705030743",
    name: "BAYEDE ROYAL CHENIN BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 28
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002269006247",
    name: "CAPE AUCTION RESERVE COLOMBAR 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 32
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009615620584",
    name: "DARLING CELLARS RESERVE SAU BLANC 2025 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 41
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQW-00002",
    name: "GERARD BERTRAND CLOS DU TEMPLE 2022 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQW-00001",
    name: "CLOSD'ORA GERARD BERTRANDD 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9421905647021",
    name: "SOUTHERN OCEAN SAUVIGNON BLANC 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8410702055635",
    name: "MUCHO MAS VIN BLANCO",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "65296410100",
    name: "MAILLY GRAND CRU CHAMPAGNE BRUT 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002260000022",
    name: "BACKSBERG CAB SAUVIGNON 2020 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6001108018014",
    name: "MANOR HOUSE CAB SAUVIGNON 2013 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5601083640104",
    name: "KOSMOS GERARED BERTRANDE 2020 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3035130501100",
    name: "BARTON & GUESTIER ROSE D'ANJOU 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5060116322255",
    name: "GLEN MORAY AGED 12 YEARS 1LIT",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010496000182",
    name: "BOWMORE ASTON MARTIN AGED 10 YEARS 1LIT",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4660012300039",
    name: "KREMLIN CLAASSIC VODAKA 500 ML",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4601775003478",
    name: "ARKHANGEISK NORTHERN AGED VODKA 50CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "46018012380",
    name: "PREMIUM VODKA 50 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "638478000071",
    name: "DOM RAMON EXTRA ANEJO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6902952894024",
    name: "MOUTAI KWEICHOW 50CL",
    unitName: "Pcs",
    categoryName: "MOUTAI",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5099873011737",
    name: "JACK DANIEL'S RYE WHISKEY 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 21
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3500610135736",
    name: "JP. CHENET CHARDONNAY BLANC BRUT 75 CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3500610134432",
    name: "JP. CHENET MUSCAT DEMI- SEC 75 CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5392000109865",
    name: "ST. PATRICK EXTRA DRY GIN 70 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080686976257",
    name: "ROKU GIN SELECT EDITION 100 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080686003663",
    name: "ROKU GIN SAKURA BLOOM EDITION 70 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002039005753",
    name: "ROBERTSON WINERY NATURAL SWEET WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3500610122378",
    name: "J.P CHENET FASHION APPLE 75CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5060204340864",
    name: "SIPSMITH LONDON DRY GIN 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3500610110238",
    name: "JP. CHENET ICE EDITION PINOT NOIR ROSE DEMI-SEC 1.5 LIT",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5055807401883",
    name: "THE BOTANIST ISLAY DRY GIN 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "0745178709576",
    name: "GEBETA SYRAH MEDIUM DRY ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "0745178709569",
    name: "GEBETA CHENIN BLANC MEDIUM DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 43
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "97988907419744",
    name: "CASTEL CUV PER CABERNET MALBEC DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQ-00039",
    name: "Armand De Brignac Brut Gold",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQ-00038",
    name: "Armand De Brignac Brut Rose",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQ-00024",
    name: "L'alliance Brut Mousseux 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQ-000046",
    name: "IDDA ETNA ROSSO 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "LQ-0000044",
    name: "CH. LA CROIX DU CASSE 2018 POMEROL 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "IT-00001-19",
    name: "Test Item",
    unitName: "Pcs",
    categoryName: "Test",
    qtyOnHand: 39
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "CH-0002",
    name: "CH. DU CARTILLON 2015 RED WINE 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "CH-0001",
    name: "CH. GRANDE - RENAISSANCE 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9798890741974",
    name: "CASTEL CUV PRE CABERNET MALBEC DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592951721",
    name: "DA VINCHI GOURMET MANGO FRUIT 1LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: -4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592949766",
    name: "DA VINCHI GOURMET PASSIONFRUIT MIX 1LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592710076",
    name: "DAVINCHI GOURMET PECAN PARLINE SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592624724",
    name: "DAVINCHI GOURMET MAJESTICS MANGO SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592584905",
    name: "DA VINCHI GOURMET SALTED CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592584608",
    name: "DA VINCHI GOURMET CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592535099",
    name: "DA VINCHI GOURMET PEACH GARDEN SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592529128",
    name: "DAVINCHI GOURMET EUROPEAN STRAWBERRY SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 30
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592513585",
    name: "DA VINCHI GOURMET HAZELNUT SYRUP",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 45
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592513578",
    name: "DA VINCHI GOURMET CARAMEL SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592513530",
    name: "DA VINCHI GOURMET CHOCOLATE FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592513196",
    name: "DA VINCHI GOURMET MENTA CUBANO SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 39
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592513172",
    name: "DA VINCHI GOURMET BLUE OCEAN SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 51
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592513165",
    name: "DA VINCHI GOURMET GRENADINE POMEGRANATE SYRUP 75CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 46
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592168198",
    name: "DAVINCHI GOURMET PUMPKIN SPICE SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592166811",
    name: "DAVINCHI GOURMET COCONUT SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 53
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592129205",
    name: "DAVINCHI GOURMET POMELO GRAPEFRUIT SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9556592000016",
    name: "DAVINCHI GOURMET FRAPPEASE POWDER 1.15 KG",
    unitName: "Pcs",
    categoryName: "Snacks",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000142616",
    name: "CASTEL RIFT VALLEY CHENIN BLANC DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000024493",
    name: "castel Rift Valley Cuvee Prestige Cha 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000024479",
    name: "Acacia Medium Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 32
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000024462",
    name: "Acacia Dry Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000024455",
    name: "Acacia Medium Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000024417",
    name: "Rift Valley Cabernet Sauvignon 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 68
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "950600002441",
    name: "Rift Vally Dry Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 44
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9506000024400",
    name: "Rift Valley Sirah 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9421018070709",
    name: "DUSKY SOUNDS SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9418408030016",
    name: "CLOUDY BAY SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9319020005591",
    name: "WHISTLING DUCK 2023 CHARDONNAY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 25
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9319020005577",
    name: "WHISTLING DUCK 2024 SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311789563466",
    name: "OXFORD LANDING MERLOT 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311789279596",
    name: "OXFORD LANDING CAB SAU SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311220005005",
    name: "19 CRIMES SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 19
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043066047",
    name: "BANROCK STATION SAU BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043049217",
    name: "HARDY'S CABERNET MERLOT 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 39
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043027390",
    name: "HARDY'S NATTAGE HILL SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 33
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043024511",
    name: "HARDY'S CHARDONNAY SEMILLON 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 47
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043015403",
    name: "HARDY'S THE RIDDLE CHARDONNAY 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043015038",
    name: "HARDY'S THE RIDDLE SAUV BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043014901",
    name: "HARDY'S THE RIDDLE CAB MERLOT 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 59
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043000249",
    name: "HARDY'S NATTAGE HILL CHARDONNAY 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 36
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9311043000225",
    name: "HARDY'S NATTAGE HILL CAB SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9310297042906",
    name: "PENFOLDS BIN 2 SHIRAZ MATARO 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9310297029754",
    name: "PENFOLDS ST. HENRI SHIRAZ 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9310297010905",
    name: "PENFOLDS KOONUNGA HILL SHIRAZ CABERNET 2019",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9310297004928",
    name: "PENFOLDS FATHER GRAND TAWNY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9300770065720",
    name: "WOLF BLASS EAGLEHAWK MERLOT 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9300727513007",
    name: "JACOB'S CREEK CAB SAUVIGNON 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "9300727009418",
    name: "JACOB'S CREEK CLASSIC PINOT NOIR 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "90162602",
    name: "Red Bull Energy Drink 250ml",
    unitName: "Pcs",
    categoryName: "ENERGIZER",
    qtyOnHand: 1623
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "88076161870",
    name: "Ciroc Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 187
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8716000965066",
    name: "Bols Triple Sec 70 Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8716000964984",
    name: "Bols Cacao Brown 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8716000964922",
    name: "Bols Cream De Casis 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8716000964717",
    name: "Bols Parfait Amour 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "87000006935",
    name: "Capitan Morgan Black 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "860001753417",
    name: "KOMOS ANEJO CRISTALINO TEQUILA 75CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "856724006206",
    name: "CASAMIGOS REPOSADO GOLD 100 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 63
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "856724006107",
    name: "Casamigos Tequila Sliver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 76
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8437008960388",
    name: "Premium Gin Gold 999.9",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8411640000480",
    name: "GIN MARE 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "836206002391",
    name: "CHOCOHOLIC PINOTAGE 2022 75CL 86",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "836206001240",
    name: "DARLING CELLARS OLD BUSH VINES BLANC 19 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 39
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "836206001226",
    name: "DARLING CELLARS OLD BUSH VINES CINSAUT 2019 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 37
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "836206000724",
    name: "SIR CHARLES DARLING VITTGE 2020 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 27
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "82184090442",
    name: "Jack Danel No.7 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 116
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "80480280017",
    name: "Grey Goose Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 108
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8043240043",
    name: "Chivas Regal 12years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 85
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663105048",
    name: "FANTINEL EXTRA DRY PROSECCO 75 CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663101088",
    name: "fantinel ROCCIAPONCA Pinot Grigio 2020 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663101071",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C JUDRI SAUVIGNON 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 36
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663088570",
    name: "FANTINEL SAUVIGNON BORGA FESIS WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663088518",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C VENKO RED BLEND 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 34
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663088037",
    name: "FANTINEL ONE AND ONLY ROSE BRUT 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663085302",
    name: "FANTINEL PINOT GRIGIO BORGA FESES 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8009663085289",
    name: "FANTINEL CAB SAUVIGNON BORGA FESES 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8008900005394",
    name: "TERRE AFFEGRE TREBBIANO 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8008900005387",
    name: "TERRE AFFEGRE SANGIOVESE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 32
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829989699",
    name: "Bottega Stella Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829989200",
    name: "Bottega White 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829988609",
    name: "Botteha Negrono Premix 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829983314",
    name: "Bottega Bacur Gin 70cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "80058299831780",
    name: "BOTTEGA LL VINO DELL'AMORE PETALO MOSCATO 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829982355",
    name: "Bottega Pinot Grigio Delle Venezie 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829981617",
    name: "Bottega Collio Doc Pinot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829980269",
    name: "Bottega Prosecco Stardust 1.5L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829980153",
    name: "Bottega Prosecco Stardust 3L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829979362",
    name: "Bottega Rose Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829978204",
    name: "Bottega Brunello Di Montalcino Riserva 2013 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829240042",
    name: "BOTTEGA FRAGOLINO ROSE PARTY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829233334",
    name: "Bottega Gold 3lL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829232337",
    name: "Bottega Gold 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 50
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829231521",
    name: "Bottega Amarone Della valpolicella riserva 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829230470",
    name: "Bottega White Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829230388",
    name: "Bottega Rose Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829230043",
    name: "Bottega Prosecco 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 59
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829222055",
    name: "PRONOL SAMBUCA 70 CL *6",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 39
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005829033156",
    name: "Bottega Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8005713114053",
    name: "Romana Black 75cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8004747009441",
    name: "ANTICA SAMBUCA CLASSIC 100 CL",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 32
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8004747008611",
    name: "Antica Sambuca Cherry 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8004747007508",
    name: "Antica Sambuca Banana 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8004747007461",
    name: "Antica Sambuca With Liquorice Flavour 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8004747006754",
    name: "Antica Sambuca Raspberry 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8004400001003",
    name: "Fernet Branca 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 73
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8003905043952",
    name: "Grappa Prosecco 70CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8003905040517",
    name: "Ast. Fashion Victim Cuvee 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8003905040289",
    name: "Ast.Puro Merlot 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8003405007485",
    name: "Roberto Cavali Rosemary 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 29
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8003405007478",
    name: "Roberto Cavali Orange 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8002235007337",
    name: "CASTELLO DI ALBOLA CHIANTI CLASSICO 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8002230000012",
    name: "Aperol 1919 1l",
    unitName: "Pcs",
    categoryName: "APERITIF",
    qtyOnHand: 88
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8001110016341",
    name: "Disaronno 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8000570484004",
    name: "Martini Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8000330001175",
    name: "AMARO MONTENEGRO 1L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "8000040500036",
    name: "WILD TURKEY 101 BOURBON WHISKEY 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7804320510170",
    name: "CASILLERO DEL DIABLO SHIRAZ 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7804320303178",
    name: "CASILLERO DEL DIABLO CABERNET SAUIGNON 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7804320256900",
    name: "CASILLERO DEL DIABLO CHARDONNAY 2023 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 32
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7804320087016",
    name: "CASILLERO DEL DIABLO CARMENERE 2021 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7798130466515",
    name: "ANDES SOUL ARGENTO SYRAH 2023",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 29
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7798130465594",
    name: "ANDES SOUL ARGENTO MALBEC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 20
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7790975003986",
    name: "TERRAZAS DE LOS ANDES CHARDONNAY 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7640171035604",
    name: "ROYAL BRACKLA AGED 18 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7610594251950",
    name: "Kahlua Coffee 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7610113007495",
    name: "BACARDI SPICED 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7610113001455",
    name: "BACARDI ANEJO CUATRO AGED 4 YEARS 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "753604062195",
    name: "OPUS ONE 2019",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7506064300344",
    name: "Donjulio 1942",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7501035042315",
    name: "Jose Curvo Silver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 80
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7501035013124",
    name: "1800 Reposado 70cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7501035010093",
    name: "Jose Cuervo Gold 100Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7501012916127",
    name: "Camino Silver 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 124
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7501012914611",
    name: "Camino Gold 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 113
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7401005008597",
    name: "Zacapa 75CL",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "7312040017034",
    name: "Absolute Blue 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 119
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "721733005857",
    name: "PATRON EL ALTO DE AGAVE 75CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6959765000296",
    name: "HENG SHUI ELEGANT 500 ML FLAT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6916549203038",
    name: "DAO MUA XIANG RICE BLOSSOM FRAGRANCE GOLD 500ML",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6906785230868",
    name: "RED STAR ERGUOTOU 500 ML",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6906151600462",
    name: "NIULAN MOUNTAIN 500 ML",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "674545000865",
    name: "DONJULIO ANEJO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 25
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "674545000858",
    name: "Donjuulio Resposado 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 228
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "674545000841",
    name: "Donjulio Blanco 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 40
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "619947000013",
    name: "Tito's Vodka 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009811000852",
    name: "CHARLES LANG & SONS CABERNET SAU RUBY CABERNET 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009802168332",
    name: "Bayede The Prince Merlot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 28
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009802168196",
    name: "Bayede The Prince Cabernet Sau 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 27
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009801167039",
    name: "KANONKOP KADETTE CAPE BLEND 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 26
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009650562030",
    name: "FISH HOEK CHENIN BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 36
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009650561996",
    name: "FISH HOEK PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009615621734",
    name: "DARLING CELLARS CHENIN BLANC 2025 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 30
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009615620560",
    name: "DARLING CELLARS MERLOT 2020 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 30
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009615620546",
    name: "DARLING CELLARS SHIRAZ 2020 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 39
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009615620522",
    name: "DARLING CELLARS CABERNET SAUVIGNON 2023 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 29
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009602547900",
    name: "Antica Natural Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 100
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "60096025478877",
    name: "ANTICA DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 87
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "60096025478633",
    name: "ANTICA DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 98
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6009602547863",
    name: "Antica Natural Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 127
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6003643009991",
    name: "CHARLES LANG & SONS SAUVIGNON BLANC 75CL NON VINTAGE",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6003643009953",
    name: "CHARLES LANG & SONS CABERNET SAUVIGNON 2024",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6003643009892",
    name: "CHARLES LANG & SONS PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6003643009878",
    name: "CHARLES LANG & SONS SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002123103006",
    name: "SIMONSIG STARTING BLOCKS CHENIN BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6002039007665",
    name: "THE CHOCOLATE BLOCK 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6001495062669",
    name: "Amarula cream 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 97
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6001452371506",
    name: "NEDERBURG SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 30
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6001452325899",
    name: "NEDEREBURG CHARDONNAY 75CL *12",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6001452303873",
    name: "Nederburg Pinotage 2022075 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6001452301862",
    name: "NEDERBURG CABERNET SAUVIGNON 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "6001452258005",
    name: "NEDERBURG SAUVIGNON BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 38
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5901867804549",
    name: "BELVEDERE SMOGORY FOREST 1lit",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5901041003362",
    name: "BELVEDERE 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 50
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5604575000479",
    name: "CABRIZ RESERVA 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5601012011500",
    name: "MATEUS THE ORIGINAL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 36
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5410316518536",
    name: "Smirnoff Vodka Red 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 147
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5410316442930",
    name: "Smirnoff Red No.21 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 141
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5202795120153",
    name: "Metaxa Stars 5 70CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5202795120085",
    name: "Metaxa 5 Star 1l",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5099873006368",
    name: "Jack Daniels Jennessee Fire 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 20
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5060045586209",
    name: "Makers Mark 46 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5060045581594",
    name: "Aftershock Red 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5060045581570",
    name: "Aftershock Blue 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5060030081238",
    name: "MASIA J MERLOT 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5060030081214",
    name: "MASIA J SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5055807400596",
    name: "THE BOTANIST ISLAY DRY GIN 22 70CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5013967019324",
    name: "DALMORE AGED 18 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5013967018228",
    name: "DALMORE AGED 21 YEARS 70 CL 2024 EDITION",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5013967017054",
    name: "DALMORE KING ALEXANDER III 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5013967016279",
    name: "THE DALMORE [ THE TRIO ]",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5011166082781",
    name: "WHITLEY NEILL GIN DISTILLER'S CUT DRY GIN 100CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5011026108019",
    name: "Tullamore DEW 1l",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5011013100118",
    name: "Baileys Irish Cream 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 64
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5011007003227",
    name: "Jamson Irish Whisky 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 192
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010852040456",
    name: "SMOKEHEAD EXTRA RARE 1L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010677935005",
    name: "Martini Extra Dry 100cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 66
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010677925006",
    name: "Martini Bianco 100cl",
    unitName: "Pcs",
    categoryName: "Vermoth",
    qtyOnHand: 21
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010677915007",
    name: "Martini Rosso 100cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010677716000",
    name: "Bombay Sapphire 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 36
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010677025812",
    name: "Bacardi Gold 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 86
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010677015738",
    name: "Bacardi White 100Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 58
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010494560121",
    name: "Glenmorangie Age 10 Yeras 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 29
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010391101007",
    name: "Drambuie 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 40
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327703053",
    name: "Hendriks Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 151
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327604008",
    name: "THE BALVENIE AGED 21 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327603056",
    name: "Monkey Shoulder 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 67
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327505138",
    name: "The Balvenie 12 yr 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 16
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327375557",
    name: "GLENFIDDICH AGED 40 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327375311",
    name: "GLENFIDDICH GRAND YOZAKURA AGED 29 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327363219",
    name: "Glenfiddich 15yrs 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 130
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327325330",
    name: "GLENFIDDICH PROJECT XX 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327325323",
    name: "Glenfiddich 18yrs 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 141
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327324081",
    name: "Glenfidich 21 Year 70 Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327305585",
    name: "Glenfiddich Fire & Cane 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327302201",
    name: "Glenfiddich 12y 100 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 83
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327025155",
    name: "GLENFIDDICH 12Y TRIPLE OAK TWELVE 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327015859",
    name: "Glenfiddich Grand Cru Age 23 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010327000497",
    name: "Grants Triple Wood 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 70
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314570101",
    name: "Highland Park 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314313944",
    name: "THE MACALLAN A NIGHT ON EARTH 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314305130",
    name: "THE MACALLAN ENIGMA 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314305116",
    name: "THE MACALLAN LUMINA 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314305109",
    name: "The Macallan Single MALT QUEST 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 22
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314302863",
    name: "THE MACALLAN 12Y OLD DOUBLE CASK 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314301712",
    name: "THE MACALLAN RARE CASK 2023 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010314101015",
    name: "The Famous Grouse",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 29
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010278100727",
    name: "JIM BEAM APPLE 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 32
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010196111010",
    name: "THE DALMORE AGED 12 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010134916707",
    name: "KUMALA CHARDONNAY2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010134916684",
    name: "Kumala Pinotage 2018",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010134916677",
    name: "KUMALA SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010134912310",
    name: "MUD HOUSE NEW ZEALAND SAU BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010103940184",
    name: "ROE & CO IRISH WHISKEY 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 37
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010103927956",
    name: "Khockando 15 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010103800457",
    name: "J & B Whisky 1L*12",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 77
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010093210007",
    name: "Teacher's Highland Cream 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5010019640260",
    name: "LAPHROAIG AGED 10 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000329002278",
    name: "BEEFEATER DRY GIN 100 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 68
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299621233",
    name: "THE GLENLIVET CAPTAINS RESERVE 1824 100CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299618042",
    name: "Beefeater Pink Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 63
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299609897",
    name: "The Glenlivet1824 founder's reserve Single Malt 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299278000",
    name: "The Glenlivet 18 Years Age 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299255049",
    name: "Chivas Regal 18Yrs 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 45
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299225028",
    name: "Chivas Regal 18Yrs 75Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299223055",
    name: "Capitan Morgan Gold 100 Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 90
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000299211243",
    name: "Royal Salute 21Yrs 70Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000292262716",
    name: "VAT 69 BLENDED SCOTCH WHISKY 100CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000291020805",
    name: "Tanquery L dry GIN 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 165
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000289929981",
    name: "Gordon Gin Pink 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 55
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000289020800",
    name: "Gordon Gin 100Cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 794
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281051413",
    name: "THE SINGLETON SiNGLE MALT 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 31
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281033631",
    name: "Talisker Drak Storm 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281021935",
    name: "Glenkinchie 12 years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281019390",
    name: "CAOL ILA AGE 12 YEARS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281005409",
    name: "Lagavulin 16 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000281003641",
    name: "Talisker Single Malt 10 years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 37
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267182360",
    name: "J/w Gold Label 200 Limited Edition 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 81
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267165844",
    name: "J/W 18 Year Aged 1L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 153
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267134321",
    name: "J/W Green Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 45
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267117584",
    name: "J/W Gold Label Reserve 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 530
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267114293",
    name: "J/W Blue Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 90
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267106151",
    name: "J/W& Sons King George 75 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267112077",
    name: "J/W Double Black 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 262
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267024400",
    name: "J/W Black Lable 50Cl Glass",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 54
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267023625",
    name: "J/W Black Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 677
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000267013626",
    name: "J/W Red Label 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 119
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "5000265001335",
    name: "White Horse 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4901777020313",
    name: "THE YAMAZAKI AGED 12 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4840771003383",
    name: "Petrovskaia Cranberry 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4840771003376",
    name: "PETROVSKAIA CHERRY 100 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4840771003369",
    name: "Petrovskaia Apple 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4750021002724",
    name: "Stolichnaya Premium 37cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 122
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4750021000829",
    name: "ELIT EIGHTEN 1.75",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4750021000805",
    name: "Stolichinaya Elit 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4750021000164",
    name: "Stolichnaya Premium 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 202
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4750021000157",
    name: "Stolichnaya Premium 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 257
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4750021000133",
    name: "Stolichnaya Premium 50cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 200
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4740050004967",
    name: "CRAFTER'S AROMATIC FLOWER GIN 70 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4603400000081",
    name: "Russian Standard Platinum 1l",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 13
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "42213277",
    name: "MONKEY 47 SCHWARZWALD DRY GIN 500 ML",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 30
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4067700013002",
    name: "Jagermeister SEB 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 328
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "4004752321006",
    name: "Danzka The Spirit Vodka 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3890000781125",
    name: "BELUGA NOBLE VODKA EXPORT 3 LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3890000781095",
    name: "BELUGA NOBLE VODKA EXPORT 1LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760235981945",
    name: "CH. MALESCASSE 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760150610470",
    name: "CH. LALANDE SAINT-JULIEN 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760126912881",
    name: "LES HAUTS LYNCH - MOUSSAS 2018 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760091712936",
    name: "CH LAMARSALLI MONTAGNE 19 AND 20 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760070370164",
    name: "CH. CHANTEMERLE 20-16 MEDOC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3760068130220",
    name: "CH. CAMOLONG SAINTE LEONIE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 26
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3701273700068",
    name: "Folie Rouge Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 44
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3700597302347",
    name: "Nikka Super rare old 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3666140026804",
    name: "WHISPERING ANGEL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3518690000028",
    name: "CH. VITALLIS SAINT- VERAN 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 29
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3484542839200",
    name: "CH. BAS VIN DE PROVENCE RED 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 30
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3484541829226",
    name: "CH. BAS VIN DE PROVENCE ROSE 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3430560010923",
    name: "FAIM DE LOUP SYRAH 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3391180020610",
    name: "M. CHAPOUTIER PETITE RUCHE 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3391180019317",
    name: "M. CHAPOUTIER BELLEIUCHE 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3333950101006",
    name: "Champagne Henri Moreau Brut",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 31
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3324651371010",
    name: "LAMOTHE PARROT SIGNATURE MEDIUM SWEET BLANC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3270049122026",
    name: "JEAN DES VIGNES WHITE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 36
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3270040009906",
    name: "JEAN DES VIGNES RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3258434220007",
    name: "Laurent Perrier Cuvee Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990317089",
    name: "CHAPELLE DE LA TRINITE 2016 ST.EMILION 75CLX6",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990216894",
    name: "BEAU RIVAGE BORD RONGE 75CLX6",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990047344",
    name: "LIONS DE BATAILLEY PAUILLAC 2018 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990039356",
    name: "Rivage Vdue Rouge Edulcore 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 13
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990026974",
    name: "Chateau Lynch Moussas 2011 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 4
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990025182",
    name: "CH. FONCROSE BLANC 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990018580",
    name: "Chateau Trotte Vieille 2013 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990011604",
    name: "Chapelle ESPRIT Des Mers BLANC 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3249990008772",
    name: "Beau Rivage Blanc 2018-2019 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3245996394017",
    name: "Hennessy XO Exclusive Collection 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3245996126311",
    name: "Hennessy Paradise Rare Cognac 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3245995960015",
    name: "Hennessy VS 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 32
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3245990255215",
    name: "Hennesy V.S 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3245990001218",
    name: "Hennessy Xo Extra Old 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 35
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3219820006186",
    name: "MARTELL XO EXTRA OLD 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3219820000054",
    name: "Martell Congnac Vs 1le",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3185370457054",
    name: "Moet & Chandon Ice lmperial 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 65
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3185370074831",
    name: "Moet & Chandon Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3185370068441",
    name: "Moet & Chandon Nectar 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 26
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3161420000166",
    name: "ST-Remy VSOP 1L",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3147690059103",
    name: "Gibson's Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3147690025702",
    name: "LABEL 5 BLENDED WHISKY 1LIT",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3132590089602",
    name: "Pastis Jean Canon 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 52
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3119460003272",
    name: "JAU WHITE SPARKLING 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3052911148415",
    name: "Emo Triple Sec Curaca38% 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 46
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3049610004104",
    name: "Veuve Clicquot Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3043700103814",
    name: "G.H. Mumm Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 24
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3035542004206",
    name: "Cointreau 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 52
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3035542001908",
    name: "Cointreau 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3024482270123",
    name: "Remy Martin Vsop 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3024480006472",
    name: "Remy Martin Xo 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3024480004522",
    name: "Remy Martin Xo 70Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3024480002191",
    name: "Louls XIII de Remy Martin",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 3
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3012993059504",
    name: "SIR EDWARDS'S SMOKY BLENDED SCPTCH WHISKY 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3012993046313-",
    name: "LONGCHAMPS CHARDONNAY 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 14
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3012993041677",
    name: "CH. DU GRAND SOUSSANS 2020 MARGAUX 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "3012993038899",
    name: "LAMOTHE PARROT ORIGINAL CLASSIC RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 13
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "30021662",
    name: "Remy Martin VSOP 5cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 11
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "089540448978",
    name: "Malibu Orig 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 20
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "088544018941",
    name: "Southern Comfort 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 10
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "085246139424",
    name: "Makers Mark 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080686821021",
    name: "Canadian Club 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080432108512",
    name: "AVION RESERVA 44 EXTRA ANEJO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 2
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "080432107249",
    name: "OLMECA DARK CHOCOLATE 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 17
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "0659525318758",
    name: "CONFIDENCE COLA SWEET RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 46
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "0659525318741",
    name: "CONFIDENCE CLASSIC SMOTH RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 45
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "0659525318734",
    name: "CONFIDENCE CANDY SWEET ROSE 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 41
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "0659525318727",
    name: "CONFIDENCE HONEY SWEET WHITE 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "041038000020",
    name: "DOUBLE DUTCH VODKA 5 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 116
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "041038000013",
    name: "DOUBLE DUTCH VODKA 75 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 8
  },
  {
    locationCode: "BOLE",
    shopName: "Bole",
    sku: "002123338002",
    name: "SIMONSIG STARTING BLOCKS CAB SAUV SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 53
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "850014275099",
    name: "CLASE AZUL REPOSADO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "LQ-00011",
    name: "CH.Lynch-Moussas 1996 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "LQ-000046",
    name: "IDDA ETNA ROSSO 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "IT-00001-19",
    name: "Test Item",
    unitName: "Pcs",
    categoryName: "Test",
    qtyOnHand: -1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9798890741974",
    name: "CASTEL CUV PRE CABERNET MALBEC DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 20
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9556592166811",
    name: "DAVINCHI GOURMET COCONUT SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 15
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9506000024493",
    name: "castel Rift Valley Cuvee Prestige Cha 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9506000024479",
    name: "Acacia Medium Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9506000024462",
    name: "Acacia Dry Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9506000024455",
    name: "Acacia Medium Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9506000024424",
    name: "Rift Valley Merlot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 15
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9506000024417",
    name: "Rift Valley Cabernet Sauvignon 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 47
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "950600002441",
    name: "Rift Vally Dry Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 39
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9506000024400",
    name: "Rift Valley Sirah 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 34
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9421018070709",
    name: "DUSKY SOUNDS SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9319020005591",
    name: "WHISTLING DUCK 2023 CHARDONNAY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9319020005577",
    name: "WHISTLING DUCK 2024 SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 35
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311789563466",
    name: "OXFORD LANDING MERLOT 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311789279596",
    name: "OXFORD LANDING CAB SAU SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311220005005",
    name: "19 CRIMES SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311043066047",
    name: "BANROCK STATION SAU BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311043049217",
    name: "HARDY'S CABERNET MERLOT 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311043027390",
    name: "HARDY'S NATTAGE HILL SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311043024511",
    name: "HARDY'S CHARDONNAY SEMILLON 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311043015038",
    name: "HARDY'S THE RIDDLE SAUV BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311043000249",
    name: "HARDY'S NATTAGE HILL CHARDONNAY 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "9311043000225",
    name: "HARDY'S NATTAGE HILL CAB SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "90162602",
    name: "Red Bull Energy Drink 250ml",
    unitName: "Pcs",
    categoryName: "ENERGIZER",
    qtyOnHand: 299
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "88076161870",
    name: "Ciroc Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 27
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8716000965066",
    name: "Bols Triple Sec 70 Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8716000964984",
    name: "Bols Cacao Brown 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 10
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8716000964922",
    name: "Bols Cream De Casis 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8716000964717",
    name: "Bols Parfait Amour 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "87000006935",
    name: "Capitan Morgan Black 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 27
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "856724006206",
    name: "CASAMIGOS REPOSADO GOLD 100 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "856724006107",
    name: "Casamigos Tequila Sliver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 18
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8411640000480",
    name: "GIN MARE 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "836206002391",
    name: "CHOCOHOLIC PINOTAGE 2022 75CL 86",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "836206001240",
    name: "DARLING CELLARS OLD BUSH VINES BLANC 19 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "836206001226",
    name: "DARLING CELLARS OLD BUSH VINES CINSAUT 2019 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "82184090442",
    name: "Jack Danel No.7 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 48
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "80480280017",
    name: "Grey Goose Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 27
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8043240043",
    name: "Chivas Regal 12years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 38
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8010471000203",
    name: "ARALDICA PIEMONTE BARBERA 20203 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8009663105048",
    name: "FANTINEL EXTRA DRY PROSECCO 75 CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 28
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8009663088518",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C VENKO RED BLEND 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8009663085302",
    name: "FANTINEL PINOT GRIGIO BORGA FESES 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8008900005394",
    name: "TERRE AFFEGRE TREBBIANO 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 23
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829989200",
    name: "Bottega White 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 17
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829983314",
    name: "Bottega Bacur Gin 70cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829982355",
    name: "Bottega Pinot Grigio Delle Venezie 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829981617",
    name: "Bottega Collio Doc Pinot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829980269",
    name: "Bottega Prosecco Stardust 1.5L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829980153",
    name: "Bottega Prosecco Stardust 3L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829979362",
    name: "Bottega Rose Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829233334",
    name: "Bottega Gold 3lL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829232337",
    name: "Bottega Gold 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 23
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829230524",
    name: "Bottega Amarone Della Valpolicella Classico 2016 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829230470",
    name: "Bottega White Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829230388",
    name: "Bottega Rose Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829230043",
    name: "Bottega Prosecco 200ml",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 24
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829222055",
    name: "PRONOL SAMBUCA 70 CL *6",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 42
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8005829033156",
    name: "Bottega Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8004747009441",
    name: "ANTICA SAMBUCA CLASSIC 100 CL",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 21
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8004747007461",
    name: "Antica Sambuca With Liquorice Flavour 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 22
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8004747006730",
    name: "Antica Sambuca Coffee 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8004400013181",
    name: "Fernet Branca 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 13
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8004400001003",
    name: "Fernet Branca 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 35
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8002230000012",
    name: "Aperol 1919 1l",
    unitName: "Pcs",
    categoryName: "APERITIF",
    qtyOnHand: 10
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8000160686375",
    name: "TERESA RIZZI PROSECCO BRUT 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "8000040500081",
    name: "Wild Turkey 101 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7804320510170",
    name: "CASILLERO DEL DIABLO SHIRAZ 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7804320303178",
    name: "CASILLERO DEL DIABLO CABERNET SAUIGNON 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7804320256900",
    name: "CASILLERO DEL DIABLO CHARDONNAY 2023 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7804320087016",
    name: "CASILLERO DEL DIABLO CARMENERE 2021 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7798130466515",
    name: "ANDES SOUL ARGENTO SYRAH 2023",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7798130465594",
    name: "ANDES SOUL ARGENTO MALBEC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7790975003986",
    name: "TERRAZAS DE LOS ANDES CHARDONNAY 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 19
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7610113007495",
    name: "BACARDI SPICED 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7501035042315",
    name: "Jose Curvo Silver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 17
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7501035010093",
    name: "Jose Cuervo Gold 100Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7501012916127",
    name: "Camino Silver 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 63
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7501012914611",
    name: "Camino Gold 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 46
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "7312040017034",
    name: "Absolute Blue 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 35
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "725765058508",
    name: "Rift Valley Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 49
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "721733002634",
    name: "Patron Silver 100 Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "674545000858",
    name: "Donjuulio Resposado 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 33
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "674545000841",
    name: "Donjulio Blanco 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6009811000852",
    name: "CHARLES LANG & SONS CABERNET SAU RUBY CABERNET 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6009801167039",
    name: "KANONKOP KADETTE CAPE BLEND 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6009650562030",
    name: "FISH HOEK CHENIN BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6009650561996",
    name: "FISH HOEK PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6009615621734",
    name: "DARLING CELLARS CHENIN BLANC 2025 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6009602547900",
    name: "Antica Natural Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "60096025478877",
    name: "ANTICA DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 31
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6009602547863",
    name: "Antica Natural Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 49
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6004442001018",
    name: "NAMAQUA BLANC DE BLANC 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6003643009991",
    name: "CHARLES LANG & SONS SAUVIGNON BLANC 75CL NON VINTAGE",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6003643009977",
    name: "CHARLES LANG & SONS MERLOT 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6003643009953",
    name: "CHARLES LANG & SONS CABERNET SAUVIGNON 2024",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6003643009892",
    name: "CHARLES LANG & SONS PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6003643009878",
    name: "CHARLES LANG & SONS SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6002123103006",
    name: "SIMONSIG STARTING BLOCKS CHENIN BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 18
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6002039007665",
    name: "THE CHOCOLATE BLOCK 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001495203116",
    name: "DROSTDY HOF DRY WHITE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001495201600",
    name: "DROSTDY HOF CLARET MIDIUM DRY RED 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001495062669",
    name: "Amarula cream 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 38
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001452371506",
    name: "NEDERBURG SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001452325899",
    name: "NEDEREBURG CHARDONNAY 75CL *12",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001452303873",
    name: "Nederburg Pinotage 2022075 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001452301862",
    name: "NEDERBURG CABERNET SAUVIGNON 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 10
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001452258005",
    name: "NEDERBURG SAUVIGNON BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "6001108028709",
    name: "Two Oceans Shiraz Rose 75Cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5901041003362",
    name: "BELVEDERE 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5604575000479",
    name: "CABRIZ RESERVA 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5601012011500",
    name: "MATEUS THE ORIGINAL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5410316518536",
    name: "Smirnoff Vodka Red 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 40
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5410316442930",
    name: "Smirnoff Red No.21 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 14
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5060165353729",
    name: "Blackbull 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5060030081252",
    name: "MASIA J TEMPRANILLO 2023 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5060030081238",
    name: "MASIA J MERLOT 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5060030081214",
    name: "MASIA J SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5055807400596",
    name: "THE BOTANIST ISLAY DRY GIN 22 70CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5013626111222",
    name: "taylor's fine tawny port 75 cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5012523231958",
    name: "Tia Maria 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 22
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5011013100118",
    name: "Baileys Irish Cream 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 33
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5011007025083",
    name: "JAMESON BLACK BARREL 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5011007003227",
    name: "Jamson Irish Whisky 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 50
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010677935005",
    name: "Martini Extra Dry 100cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010677925006",
    name: "Martini Bianco 100cl",
    unitName: "Pcs",
    categoryName: "Vermoth",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010677716000",
    name: "Bombay Sapphire 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 27
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010677025812",
    name: "Bacardi Gold 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 7
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010677015738",
    name: "Bacardi White 100Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 39
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010391101007",
    name: "Drambuie 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327703053",
    name: "Hendriks Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 28
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327603056",
    name: "Monkey Shoulder 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 27
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327505138",
    name: "The Balvenie 12 yr 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327363219",
    name: "Glenfiddich 15yrs 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 18
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327325323",
    name: "Glenfiddich 18yrs 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 20
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327324081",
    name: "Glenfidich 21 Year 70 Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327302201",
    name: "Glenfiddich 12y 100 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010327000497",
    name: "Grants Triple Wood 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 49
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010314570101",
    name: "Highland Park 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010314305130",
    name: "THE MACALLAN ENIGMA 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010314305109",
    name: "The Macallan Single MALT QUEST 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010314302863",
    name: "THE MACALLAN 12Y OLD DOUBLE CASK 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010314101015",
    name: "The Famous Grouse",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 28
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010278100727",
    name: "JIM BEAM APPLE 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010134916707",
    name: "KUMALA CHARDONNAY2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010134916684",
    name: "Kumala Pinotage 2018",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010134916677",
    name: "KUMALA SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010134912310",
    name: "MUD HOUSE NEW ZEALAND SAU BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010103940184",
    name: "ROE & CO IRISH WHISKEY 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 15
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010103800457",
    name: "J & B Whisky 1L*12",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 33
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5010093210007",
    name: "Teacher's Highland Cream 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 18
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000329002278",
    name: "BEEFEATER DRY GIN 100 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 37
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000299618042",
    name: "Beefeater Pink Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 7
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000299278000",
    name: "The Glenlivet 18 Years Age 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000299255049",
    name: "Chivas Regal 18Yrs 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000299225028",
    name: "Chivas Regal 18Yrs 75Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 8
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000299223055",
    name: "Capitan Morgan Gold 100 Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 18
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000291020805",
    name: "Tanquery L dry GIN 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 13
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000289929981",
    name: "Gordon Gin Pink 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 15
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000289020800",
    name: "Gordon Gin 100Cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 113
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000281021621",
    name: "THE SINGLETON SINGEL MALT 12 years 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000281019390",
    name: "CAOL ILA AGE 12 YEARS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000281003641",
    name: "Talisker Single Malt 10 years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 13
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267182360",
    name: "J/w Gold Label 200 Limited Edition 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267165844",
    name: "J/W 18 Year Aged 1L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 18
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267134321",
    name: "J/W Green Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 27
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267117584",
    name: "J/W Gold Label Reserve 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 92
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267114293",
    name: "J/W Blue Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267112077",
    name: "J/W Double Black 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 41
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267024400",
    name: "J/W Black Lable 50Cl Glass",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 69
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267023625",
    name: "J/W Black Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 137
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "5000267013626",
    name: "J/W Red Label 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 41
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "4750021002724",
    name: "Stolichnaya Premium 37cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 56
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "4750021000805",
    name: "Stolichinaya Elit 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "4750021000164",
    name: "Stolichnaya Premium 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 47
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "4750021000157",
    name: "Stolichnaya Premium 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 81
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "4750021000133",
    name: "Stolichnaya Premium 50cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 56
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "42213277",
    name: "MONKEY 47 SCHWARZWALD DRY GIN 500 ML",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "4067700013002",
    name: "Jagermeister SEB 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 34
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3890000781095",
    name: "BELUGA NOBLE VODKA EXPORT 1LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3701273700068",
    name: "Folie Rouge Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3666140026804",
    name: "WHISPERING ANGEL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3430560010923",
    name: "FAIM DE LOUP SYRAH 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3270040009906",
    name: "JEAN DES VIGNES RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3249990039356",
    name: "Rivage Vdue Rouge Edulcore 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3249990026974",
    name: "Chateau Lynch Moussas 2011 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3245995960015",
    name: "Hennessy VS 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 8
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3245990255215",
    name: "Hennesy V.S 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 4
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3245990117117",
    name: "Hennessy Xo Extra Dry 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 7
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3219820000078",
    name: "Martell VS 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3185370564721",
    name: "Dom Perignon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 6
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3185370457054",
    name: "Moet & Chandon Ice lmperial 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 8
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3185370074831",
    name: "Moet & Chandon Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 15
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3185370068441",
    name: "Moet & Chandon Nectar 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3185370000335",
    name: "Moet & Chandon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 8
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3161420000166",
    name: "ST-Remy VSOP 1L",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 14
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3147690025702",
    name: "LABEL 5 BLENDED WHISKY 1LIT",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3132590089602",
    name: "Pastis Jean Canon 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 9
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3119460003272",
    name: "JAU WHITE SPARKLING 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3052911148415",
    name: "Emo Triple Sec Curaca38% 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 29
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3035542004206",
    name: "Cointreau 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 47
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3035542001908",
    name: "Cointreau 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 26
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3024482295126",
    name: "Remy Martin Vsop 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 19
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3024482270123",
    name: "Remy Martin Vsop 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 24
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3024480006472",
    name: "Remy Martin Xo 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 3
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3024480004522",
    name: "Remy Martin Xo 70Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "3012993059504",
    name: "SIR EDWARDS'S SMOKY BLENDED SCPTCH WHISKY 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 10
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "080432107249",
    name: "OLMECA DARK CHOCOLATE 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 9
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "0659525318758",
    name: "CONFIDENCE COLA SWEET RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "0659525318741",
    name: "CONFIDENCE CLASSIC SMOTH RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "0659525318734",
    name: "CONFIDENCE CANDY SWEET ROSE 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "0659525318727",
    name: "CONFIDENCE HONEY SWEET WHITE 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "0659525318710",
    name: "CONFIDENCE CLASSIC SUMMER WHITE 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "041038000020",
    name: "DOUBLE DUTCH VODKA 5 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 44
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "041038000013",
    name: "DOUBLE DUTCH VODKA 75 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 43
  },
  {
    locationCode: "SUMMIT",
    shopName: "Summit",
    sku: "002123338002",
    name: "SIMONSIG STARTING BLOCKS CAB SAUV SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 24
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6002269004328",
    name: "FIVE'S RESERVE CAB SAUV 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "850014275099",
    name: "CLASE AZUL REPOSADO 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6009605834304",
    name: "CAPE AUCTION RESERVE CLASSIC WHITE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6009605834311",
    name: "CAPE AUCTION RESERVE CLASSIC ROSE 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6009605834205",
    name: "CAPE AUCTION RESERVE CLASSIC RED 5L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6002269004670",
    name: "TANGLED TREE TROPICAL SAU BLANC 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6002269004687",
    name: "TANGLED TREE SPICY SHIRAZ 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6002269004663",
    name: "TANGLED TREE CAB SAUVIGNON 3L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8000405000811",
    name: "WILD TURKEY 100CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5055807401883",
    name: "THE BOTANIST ISLAY DRY GIN 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 16
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000281016528",
    name: "CLYNELISH AGE 14 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "087116069817",
    name: "BELVEDERE 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 11
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "0745178709576",
    name: "GEBETA SYRAH MEDIUM DRY ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "0745178709569",
    name: "GEBETA CHENIN BLANC MEDIUM DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "LQ-00039",
    name: "Armand De Brignac Brut Gold",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 11
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "LQ-00013",
    name: "Ast.Fervo Refrontolo Passito 50 cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "LQ-000045",
    name: "GAJA BRUNELLO DI MONTALCINO PIEVE SANTA RESTITUTA 2018",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9556592584905",
    name: "DA VINCHI GOURMET SALTED CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9556592584608",
    name: "DA VINCHI GOURMET CARAMEL FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9556592530575",
    name: "DAVINCHI GOURMET PUMP 15M-0.53",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9556592513530",
    name: "DA VINCHI GOURMET CHOCOLATE FLAVOURED SAUCE 2LIT",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9556592166811",
    name: "DAVINCHI GOURMET COCONUT SYRUP 75 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9556592000016",
    name: "DAVINCHI GOURMET FRAPPEASE POWDER 1.15 KG",
    unitName: "Pcs",
    categoryName: "Snacks",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9506000142616",
    name: "CASTEL RIFT VALLEY CHENIN BLANC DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9506000024479",
    name: "Acacia Medium Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 57
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9506000024455",
    name: "Acacia Medium Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 69
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9506000024424",
    name: "Rift Valley Merlot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9506000024417",
    name: "Rift Valley Cabernet Sauvignon 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 19
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "950600002441",
    name: "Rift Vally Dry Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 19
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9506000024400",
    name: "Rift Valley Sirah 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 27
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9319020005591",
    name: "WHISTLING DUCK 2023 CHARDONNAY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9319020005577",
    name: "WHISTLING DUCK 2024 SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9312088005428",
    name: "WOLF BLASS BLACK LABEL CAB SAUV SHIRAZ MALBEC 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311789563466",
    name: "OXFORD LANDING MERLOT 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311789279596",
    name: "OXFORD LANDING CAB SAU SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311220005005",
    name: "19 CRIMES SHIRAZ 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311043049217",
    name: "HARDY'S CABERNET MERLOT 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311043024511",
    name: "HARDY'S CHARDONNAY SEMILLON 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 19
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311043015038",
    name: "HARDY'S THE RIDDLE SAUV BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 17
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311043014901",
    name: "HARDY'S THE RIDDLE CAB MERLOT 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9311043000249",
    name: "HARDY'S NATTAGE HILL CHARDONNAY 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9300770065720",
    name: "WOLF BLASS EAGLEHAWK MERLOT 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9300727620019",
    name: "JACOB'S CREEK SPARKLING ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "9300727003997",
    name: "JACOB'S CREE CLASSIC PINOT GRIGIO WHITE 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "90162602",
    name: "Red Bull Energy Drink 250ml",
    unitName: "Pcs",
    categoryName: "ENERGIZER",
    qtyOnHand: 720
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "88076161870",
    name: "Ciroc Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 41
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8716000966353",
    name: "BOLS AMSTERDAM BUTTERSCOTCH 70 CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8716000964922",
    name: "Bols Cream De Casis 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8716000964717",
    name: "Bols Parfait Amour 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 24
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "87000006935",
    name: "Capitan Morgan Black 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 45
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "856724006206",
    name: "CASAMIGOS REPOSADO GOLD 100 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 23
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "856724006107",
    name: "Casamigos Tequila Sliver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 65
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8437008960388",
    name: "Premium Gin Gold 999.9",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 13
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8411640000480",
    name: "GIN MARE 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 9
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8410162100111",
    name: "FUNDADOR SHERRY CASK FINE BRANDY 100 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8410036002015",
    name: "FREIXENET PREMIUM CAVA CARTA NEVADA",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "836206002391",
    name: "CHOCOHOLIC PINOTAGE 2022 75CL 86",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "836206001240",
    name: "DARLING CELLARS OLD BUSH VINES BLANC 19 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "836206001226",
    name: "DARLING CELLARS OLD BUSH VINES CINSAUT 2019 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 9
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "82184090442",
    name: "Jack Danel No.7 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 69
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "80480280017",
    name: "Grey Goose Blue 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 66
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8043240043",
    name: "Chivas Regal 12years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 70
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8009663105048",
    name: "FANTINEL EXTRA DRY PROSECCO 75 CL",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8009663088518",
    name: "FANTINEL TENUTA SANT' HELENA COLLIO D.O.C VENKO RED BLEND 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8008900005387",
    name: "TERRE AFFEGRE SANGIOVESE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829986230",
    name: "Bottega Prosecco D.O.C Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829985325",
    name: "BOTTEGA STAR EXTRA DRY 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829982355",
    name: "Bottega Pinot Grigio Delle Venezie 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829981617",
    name: "Bottega Collio Doc Pinot 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829980269",
    name: "Bottega Prosecco Stardust 1.5L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829980153",
    name: "Bottega Prosecco Stardust 3L",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829979362",
    name: "Bottega Rose Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829240042",
    name: "BOTTEGA FRAGOLINO ROSE PARTY 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829230470",
    name: "Bottega White Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 11
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829230388",
    name: "Bottega Rose Gold 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829230333",
    name: "Bottlega Gold 75Cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829222055",
    name: "PRONOL SAMBUCA 70 CL *6",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 37
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829220648",
    name: "BOTTEGA PETALO VINO DELL AMORE MOSCATO 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005829033156",
    name: "Bottega Gold 1.5litre",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8005713114053",
    name: "Romana Black 75cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8004747009441",
    name: "ANTICA SAMBUCA CLASSIC 100 CL",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 24
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8004747008611",
    name: "Antica Sambuca Cherry 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8004747007508",
    name: "Antica Sambuca Banana 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8004747007461",
    name: "Antica Sambuca With Liquorice Flavour 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 10
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8004747006754",
    name: "Antica Sambuca Raspberry 70cl",
    unitName: "Pcs",
    categoryName: "SAMBUCA",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8004400013181",
    name: "Fernet Branca 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 16
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8004400001003",
    name: "Fernet Branca 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 24
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8003405007485",
    name: "Roberto Cavali Rosemary 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8002235022965",
    name: "ZINZULA ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8002235007337",
    name: "CASTELLO DI ALBOLA CHIANTI CLASSICO 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8002230000012",
    name: "Aperol 1919 1l",
    unitName: "Pcs",
    categoryName: "APERITIF",
    qtyOnHand: 15
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8000570484004",
    name: "Martini Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 10
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8000570435402",
    name: "Martini Asti 75cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 23
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8000330001175",
    name: "AMARO MONTENEGRO 1L",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "8000020000044",
    name: "Cizano Extra Dry 1L",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7804320256900",
    name: "CASILLERO DEL DIABLO CHARDONNAY 2023 2019 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7798130466515",
    name: "ANDES SOUL ARGENTO SYRAH 2023",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7610113007495",
    name: "BACARDI SPICED 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7610113001455",
    name: "BACARDI ANEJO CUATRO AGED 4 YEARS 1LIT",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7506064300344",
    name: "Donjulio 1942",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 8
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7501035042322",
    name: "Jose Cuervo Silver 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7501035042315",
    name: "Jose Curvo Silver 100cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 91
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7501012916127",
    name: "Camino Silver 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 72
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7501012914611",
    name: "Camino Gold 75Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 51
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "7312040017034",
    name: "Absolute Blue 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 45
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "725765058508",
    name: "Rift Valley Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 34
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "721733002634",
    name: "Patron Silver 100 Cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 8
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "674545000858",
    name: "Donjuulio Resposado 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 41
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "674545000841",
    name: "Donjulio Blanco 75cl",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 9
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6009650561996",
    name: "FISH HOEK PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6009602547900",
    name: "Antica Natural Sweet Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 8
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "60096025478877",
    name: "ANTICA DRY WHITE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 38
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "60096025478633",
    name: "ANTICA DRY RED 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 42
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6009602547863",
    name: "Antica Natural Sweet Red 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 70
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6003643009991",
    name: "CHARLES LANG & SONS SAUVIGNON BLANC 75CL NON VINTAGE",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6003643009977",
    name: "CHARLES LANG & SONS MERLOT 2022",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6003643009953",
    name: "CHARLES LANG & SONS CABERNET SAUVIGNON 2024",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6003643009892",
    name: "CHARLES LANG & SONS PINOTAGE 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6003643009878",
    name: "CHARLES LANG & SONS SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6002123103006",
    name: "SIMONSIG STARTING BLOCKS CHENIN BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6002039007665",
    name: "THE CHOCOLATE BLOCK 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 16
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6001495062669",
    name: "Amarula cream 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 48
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6001452371506",
    name: "NEDERBURG SHIRAZ 2022 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6001452325899",
    name: "NEDEREBURG CHARDONNAY 75CL *12",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6001452301862",
    name: "NEDERBURG CABERNET SAUVIGNON 2020 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "6001452258005",
    name: "NEDERBURG SAUVIGNON BLANC 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5901041003362",
    name: "BELVEDERE 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5901041003164",
    name: "BELVEDERE VODAK 3LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5601012011500",
    name: "MATEUS THE ORIGINAL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5410316518536",
    name: "Smirnoff Vodka Red 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 83
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5410316442930",
    name: "Smirnoff Red No.21 100Cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 75
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5202795120153",
    name: "Metaxa Stars 5 70CL",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5060294565376",
    name: "Indian Summer 70cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5060294560951",
    name: "Smokin 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5060165353729",
    name: "Blackbull 12 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5060045581594",
    name: "Aftershock Red 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5060045581570",
    name: "Aftershock Blue 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5060030081252",
    name: "MASIA J TEMPRANILLO 2023 75 CL*6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5060030081214",
    name: "MASIA J SAUVIGNON BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 21
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5013626111222",
    name: "taylor's fine tawny port 75 cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5011013100118",
    name: "Baileys Irish Cream 100Cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 34
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5011007025083",
    name: "JAMESON BLACK BARREL 75CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5011007003227",
    name: "Jamson Irish Whisky 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 64
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010677935005",
    name: "Martini Extra Dry 100cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 20
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010677925006",
    name: "Martini Bianco 100cl",
    unitName: "Pcs",
    categoryName: "Vermoth",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010677915007",
    name: "Martini Rosso 100cl",
    unitName: "Pcs",
    categoryName: "VERMOUTH",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010677716000",
    name: "Bombay Sapphire 1L",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 54
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010677025812",
    name: "Bacardi Gold 100cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 31
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010677015738",
    name: "Bacardi White 100Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 82
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010494560121",
    name: "Glenmorangie Age 10 Yeras 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010391101007",
    name: "Drambuie 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 14
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327703053",
    name: "Hendriks Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 85
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327604008",
    name: "THE BALVENIE AGED 21 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327603056",
    name: "Monkey Shoulder 1 L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 34
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327505138",
    name: "The Balvenie 12 yr 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 10
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327363226",
    name: "GLENFIDDICH 18 YEARS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327363219",
    name: "Glenfiddich 15yrs 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 53
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327325323",
    name: "Glenfiddich 18yrs 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 46
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327325125",
    name: "GLENFIDDICH 15 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327324081",
    name: "Glenfidich 21 Year 70 Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327302201",
    name: "Glenfiddich 12y 100 cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 43
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010327000497",
    name: "Grants Triple Wood 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 51
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010314305116",
    name: "THE MACALLAN LUMINA 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010314302863",
    name: "THE MACALLAN 12Y OLD DOUBLE CASK 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010314101015",
    name: "The Famous Grouse",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010278100727",
    name: "JIM BEAM APPLE 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010134916707",
    name: "KUMALA CHARDONNAY2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010134916684",
    name: "Kumala Pinotage 2018",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010134916677",
    name: "KUMALA SHIRAZ 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010134912310",
    name: "MUD HOUSE NEW ZEALAND SAU BLANC 2023 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010103800457",
    name: "J & B Whisky 1L*12",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 60
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010093210007",
    name: "Teacher's Highland Cream 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 25
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5010019640260",
    name: "LAPHROAIG AGED 10 YEARS 70 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000329002278",
    name: "BEEFEATER DRY GIN 100 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 53
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000299618042",
    name: "Beefeater Pink Gin 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 51
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000299255049",
    name: "Chivas Regal 18Yrs 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 24
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000299226216",
    name: "The Glenlivet 21 Year Single Malt 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000299225028",
    name: "Chivas Regal 18Yrs 75Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000299223055",
    name: "Capitan Morgan Gold 100 Cl",
    unitName: "Pcs",
    categoryName: "RUM",
    qtyOnHand: 46
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000291020805",
    name: "Tanquery L dry GIN 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 101
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000289929981",
    name: "Gordon Gin Pink 100cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 17
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000289020800",
    name: "Gordon Gin 100Cl",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 648
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000281051413",
    name: "THE SINGLETON SiNGLE MALT 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 19
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000281019390",
    name: "CAOL ILA AGE 12 YEARS 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000281005409",
    name: "Lagavulin 16 Years 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000281003641",
    name: "Talisker Single Malt 10 years 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267182360",
    name: "J/w Gold Label 200 Limited Edition 1litre",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 9
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267165844",
    name: "J/W 18 Year Aged 1L",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 28
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267134321",
    name: "J/W Green Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 17
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267117584",
    name: "J/W Gold Label Reserve 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 137
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267114293",
    name: "J/W Blue Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 24
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267112077",
    name: "J/W Double Black 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 77
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267107776",
    name: "J/W Gold Label Reserve 75cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 15
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267091006",
    name: "J/w Swing Blended Scotch Whisky 75cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267024400",
    name: "J/W Black Lable 50Cl Glass",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 45
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267023625",
    name: "J/W Black Label 100cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 327
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "5000267013626",
    name: "J/W Red Label 100Cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 46
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4901777020313",
    name: "THE YAMAZAKI AGED 12 YEARS 70CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4750021003905",
    name: "Stoli Gold 70cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 13
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4750021002724",
    name: "Stolichnaya Premium 37cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 60
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4750021000805",
    name: "Stolichinaya Elit 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4750021000164",
    name: "Stolichnaya Premium 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 346
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4750021000157",
    name: "Stolichnaya Premium 75cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 399
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4750021000133",
    name: "Stolichnaya Premium 50cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 463
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4740050004967",
    name: "CRAFTER'S AROMATIC FLOWER GIN 70 CL",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "42213277",
    name: "MONKEY 47 SCHWARZWALD DRY GIN 500 ML",
    unitName: "Pcs",
    categoryName: "GIN",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4067700013002",
    name: "Jagermeister SEB 1L",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 333
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "4004752321006",
    name: "Danzka The Spirit Vodka 100cl",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 48
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3890000781095",
    name: "BELUGA NOBLE VODKA EXPORT 1LIT",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 14
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3701273700068",
    name: "Folie Rouge Malbec 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3700597302347",
    name: "Nikka Super rare old 70cl",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3666140026804",
    name: "WHISPERING ANGEL ROSE 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3560751810015",
    name: "CH. DE HAUX 2018 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3484541829226",
    name: "CH. BAS VIN DE PROVENCE ROSE 2022 75CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3430560010923",
    name: "FAIM DE LOUP SYRAH 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3391180020061",
    name: "MARIUS SYRAH GRENACHE 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 22
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3391180019287",
    name: "MARIUS ROSE DOC 2021 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3249990018580",
    name: "Chateau Trotte Vieille 2013 75cl",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 6
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3245996126311",
    name: "Hennessy Paradise Rare Cognac 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3245995960015",
    name: "Hennessy VS 70 CL",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 55
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3245990255215",
    name: "Hennesy V.S 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 8
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3245990117117",
    name: "Hennessy Xo Extra Dry 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3245990001218",
    name: "Hennessy Xo Extra Old 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 70
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3219820005868",
    name: "Martell Vsop 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3219820000078",
    name: "Martell VS 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3211209207917",
    name: "Very Pamp Rose 75cl",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3185370564721",
    name: "Dom Perignon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 10
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3185370457054",
    name: "Moet & Chandon Ice lmperial 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 31
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3185370074831",
    name: "Moet & Chandon Rose 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 9
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3185370068441",
    name: "Moet & Chandon Nectar 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3185370000335",
    name: "Moet & Chandon Brut 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 23
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3147690025702",
    name: "LABEL 5 BLENDED WHISKY 1LIT",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 4
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3132590089602",
    name: "Pastis Jean Canon 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 7
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3052911148415",
    name: "Emo Triple Sec Curaca38% 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 20
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3047100090309",
    name: "Pernod Paris 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 11
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3043700104002",
    name: "Mumm Champagne Demi Sec 75cl",
    unitName: "Pcs",
    categoryName: "CHAMPAGNE",
    qtyOnHand: 10
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3035542004206",
    name: "Cointreau 70cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 15
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3035542001908",
    name: "Cointreau 100cl",
    unitName: "Pcs",
    categoryName: "LIQUER",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3024482295126",
    name: "Remy Martin Vsop 100Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 23
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3024482270123",
    name: "Remy Martin Vsop 70cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 15
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3024480006472",
    name: "Remy Martin Xo 100cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 1
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3024480004522",
    name: "Remy Martin Xo 70Cl",
    unitName: "Pcs",
    categoryName: "COGNAC",
    qtyOnHand: 13
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "3012993059504",
    name: "SIR EDWARDS'S SMOKY BLENDED SCPTCH WHISKY 100 CL",
    unitName: "Pcs",
    categoryName: "WHISKY",
    qtyOnHand: 2
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "09556592482225",
    name: "DAVINCHI GOURMET PUMP 10ML - 034",
    unitName: "Pcs",
    categoryName: "Win",
    qtyOnHand: 5
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "080432107249",
    name: "OLMECA DARK CHOCOLATE 75 CL",
    unitName: "Pcs",
    categoryName: "TEQUILA",
    qtyOnHand: 40
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "0659525318741",
    name: "CONFIDENCE CLASSIC SMOTH RED 75 CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 12
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "0659525318710",
    name: "CONFIDENCE CLASSIC SUMMER WHITE 75CL *6",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 3
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "041038000020",
    name: "DOUBLE DUTCH VODKA 5 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 27
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "041038000013",
    name: "DOUBLE DUTCH VODKA 75 CL",
    unitName: "Pcs",
    categoryName: "VODKA",
    qtyOnHand: 54
  },
  {
    locationCode: "SHALA",
    shopName: "Shala",
    sku: "002123338002",
    name: "SIMONSIG STARTING BLOCKS CAB SAUV SHIRAZ 2024 75 CL",
    unitName: "Pcs",
    categoryName: "WINE",
    qtyOnHand: 11
  }
];

function money(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0);
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function categoryNameForSeed(row: ShopStockSeedRow) {
  const categoryName = row.categoryName.trim();

  return categoryName === "-" ? null : categoryName || null;
}

function validateStockRows(rows: ShopStockSeedRow[]) {
  const duplicateKeys = rows
    .map((row) => row.locationCode + "::" + row.sku)
    .filter((key, index, keys) => keys.indexOf(key) !== index);

  if (duplicateKeys.length > 0) {
    throw new Error("Duplicate shop/article rows found: " + Array.from(new Set(duplicateKeys)).join(", "));
  }

  const productNames = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!productNames.has(row.sku)) {
      productNames.set(row.sku, new Set());
    }
    productNames.get(row.sku)?.add(row.name);
  }

  const conflictingNames = Array.from(productNames.entries()).filter(([, names]) => names.size > 1);
  if (conflictingNames.length > 0) {
    throw new Error(
      "Conflicting names found for article codes: " + conflictingNames
        .map(([sku, names]) => sku + ": " + Array.from(names).join(" | "))
        .join("; ")
    );
  }

  return rows;
}

function firstProductRowsBySku(rows: ShopStockSeedRow[]) {
  const rowBySku = new Map<string, ShopStockSeedRow>();

  for (const row of rows) {
    if (!rowBySku.has(row.sku)) {
      rowBySku.set(row.sku, row);
    }
  }

  return rowBySku;
}

async function seedUnits(rows: ShopStockSeedRow[]) {
  const unitByName = new Map<string, string>();
  const unitNames = uniqueValues(rows.map((row) => row.unitName || FALLBACK_UNIT_NAME));

  for (const name of unitNames) {
    const existingUnit = await prisma.unit.findUnique({ where: { name } });
    const unit = existingUnit ?? (await prisma.unit.create({ data: { name, isActive: true } }));

    unitByName.set(name, unit.id);
  }

  return unitByName;
}

async function seedCategories(rows: ShopStockSeedRow[]) {
  const categoryByName = new Map<string, string>();
  const categoryNames = uniqueValues(
    rows
      .map((row) => categoryNameForSeed(row))
      .filter((categoryName): categoryName is string => Boolean(categoryName))
  );

  for (const name of categoryNames) {
    const existingCategory = await prisma.category.findUnique({ where: { name } });
    const category = existingCategory ?? (await prisma.category.create({ data: { name, isActive: true } }));

    categoryByName.set(name, category.id);
  }

  return categoryByName;
}

async function main() {
  const stockRows = validateStockRows(STOCK_SEED_ROWS);
  const locationCodes = uniqueValues(stockRows.map((row) => row.locationCode));
  const locations = await prisma.location.findMany({
    where: { code: { in: locationCodes } },
    select: { id: true, code: true, name: true },
  });
  const locationByCode = new Map(locations.map((location) => [location.code, location]));
  const missingLocationCodes = locationCodes.filter((code) => !locationByCode.has(code));

  if (missingLocationCodes.length > 0) {
    throw new Error("Missing shop locations: " + missingLocationCodes.join(", ") + ". Run prisma/seed.ts before this seed.");
  }

  const existingSeedMovementCount = await prisma.stockMovement.count({
    where: {
      sourceType: SOURCE_TYPE,
      sourceId: SOURCE_ID,
      locationId: { in: locations.map((location) => location.id) },
    },
  });

  if (existingSeedMovementCount > 0) {
    throw new Error(
      "This shop stock seed already has " +
        existingSeedMovementCount +
        " stock movement rows in the database. No production data was changed. Use a new SOURCE_ID only after confirming you want to apply a separate stock adjustment."
    );
  }

  const rowBySku = firstProductRowsBySku(stockRows);
  const skus = Array.from(rowBySku.keys());
  const existingProducts = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: {
      id: true,
      sku: true,
      name: true,
      unitId: true,
      buyingPrice: true,
    },
  });
  const productBySku = new Map(existingProducts.map((product) => [product.sku, product]));
  const missingProductRows = skus
    .filter((sku) => !productBySku.has(sku))
    .map((sku) => rowBySku.get(sku))
    .filter((row): row is ShopStockSeedRow => Boolean(row));

  const [categoryByName, unitByName] =
    missingProductRows.length > 0
      ? await Promise.all([seedCategories(missingProductRows), seedUnits(missingProductRows)])
      : [new Map<string, string>(), new Map<string, string>()];

  let createdProducts = 0;

  for (const row of missingProductRows) {
    const unitId = unitByName.get(row.unitName || FALLBACK_UNIT_NAME);
    const categoryName = categoryNameForSeed(row);
    const categoryId = categoryName ? categoryByName.get(categoryName) ?? null : null;

    if (!unitId) {
      throw new Error("Missing seeded unit for item " + row.sku + ": " + row.unitName);
    }

    if (categoryName && !categoryId) {
      throw new Error("Missing seeded category for item " + row.sku + ": " + categoryName);
    }

    const product = await prisma.product.create({
      data: {
        sku: row.sku,
        name: row.name,
        categoryId,
        unitId,
        unitId: null,
        buyingPrice: money(0),
        sellingPrice: money(0),
        buyingPrice: money(0),
        sellingPrice: money(0),
        description: "Created from " + row.shopName + " shop opening stock seed",
        isActive: true,
      },
      select: {
        id: true,
        sku: true,
        name: true,
        unitId: true,
        buyingPrice: true,
      },
    });

    productBySku.set(product.sku, product);
    createdProducts += 1;
  }

  const movementRows = stockRows.map((row) => {
    const product = productBySku.get(row.sku);
    const location = locationByCode.get(row.locationCode);

    if (!product) {
      throw new Error("Missing product after validation: " + row.sku);
    }

    if (!location) {
      throw new Error("Missing location after validation: " + row.locationCode);
    }

    return {
      locationId: location.id,
      productId: product.id,
      movementType: StockMovementType.ADJUSTMENT,
      quantity: row.qtyOnHand,
      unitCost: money(product.buyingPrice),
      unitValue: money(product.buyingPrice),
      movementDate: MOVEMENT_DATE,
      sourceType: SOURCE_TYPE,
      sourceId: SOURCE_ID,
      sourceLineId: row.locationCode + ":" + row.sku,
      balanceAfter: row.qtyOnHand,
    };
  });

  await prisma.$transaction(
    async (tx) => {
      await tx.stockMovement.createMany({ data: movementRows });
    },
    { timeout: 60_000 }
  );

  console.log("Shop stock seed completed from embedded workbook data.");
  for (const source of STOCK_SEED_SOURCE) {
    console.log(source.shopName + " (" + source.locationCode + ") rows: " + source.rows);
  }
  console.log("Stock rows seeded: " + stockRows.length);
  console.log("Unique article codes cross-checked: " + skus.length);
  console.log("Article codes already found in products before this run: " + existingProducts.length);
  console.log("New products created: " + createdProducts);
  console.log("Negative stock rows included: " + stockRows.filter((row) => row.qtyOnHand < 0).length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });