import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  Prisma,
  PrismaClient,
  StockMovementType,
} from "../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required to run the Addis Ababa stock seed script.",
  );
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const LOCATION_CODE = "ADDIS-ABABA";
const SOURCE_TYPE = "OPENING_STOCK_SEED";
const SOURCE_ID = "addis-ababa-main-stock-2026-05-27";
const DEFAULT_CATEGORY_NAME = "-";
const DEFAULT_UNIT_NAME = "Pcs";

type StockSeedRow = {
  sku: string;
  description: string;
  qtyOnHand: number;
};

const STOCK_SEED_ROWS: StockSeedRow[] = [
  {
    sku: "002123338002",
    description: "SIMONSIG STARTING BLOCKS CAB S",
    qtyOnHand: 96,
  },
  {
    sku: "0659525318710",
    description: "CONFIDDNICE SUMMER WHITE",
    qtyOnHand: 54,
  },
  {
    sku: "0659525318727",
    description: "CONFIDENCE HONEY SWEET WHITE",
    qtyOnHand: 228,
  },
  {
    sku: "0659525318734",
    description: "CONFIDENCE CANDY SWWET ROSE",
    qtyOnHand: 354,
  },
  {
    sku: "0659525318741",
    description: "CONFIDENCE CLASSIC SMOTH RED",
    qtyOnHand: 78,
  },
  {
    sku: "0659525318758",
    description: "CONFIDENCE COLA SWEET RED",
    qtyOnHand: 852,
  },
  {
    sku: "0721733002573",
    description: "PATRON ANEJO GOLD 1L",
    qtyOnHand: 84,
  },
  {
    sku: "080432107249",
    description: "OLMECA DARK CHOCOLATE 75 CL",
    qtyOnHand: 336,
  },
  {
    sku: "08068600366",
    description: "ROKU GIN SAKURA BLOOM EDITION",
    qtyOnHand: 0,
  },
  {
    sku: "080686007913",
    description: "HIBIKI SUNTORY WHISKY 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "080686008149",
    description: "YAMAZAKI ISLAY PEATED 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "080686816201",
    description: "CANADIAN CLUB 1858 1L",
    qtyOnHand: 0,
  },
  {
    sku: "08068697625",
    description: "ROKU GIN SELECT EDTTION",
    qtyOnHand: 0,
  },
  {
    sku: "082184000328",
    description: "JACK DANIEL HONEY 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "085246500750",
    description: "MAKER'S MARK 101 1L",
    qtyOnHand: 36,
  },
  {
    sku: "085246502327",
    description: "MAKER'S MARK NO 46",
    qtyOnHand: 0,
  },
  {
    sku: "086003000087",
    description: "Wood Bridge BY ROBERT MONDAVI",
    qtyOnHand: 0,
  },
  {
    sku: "086003000094",
    description: "WOOD BRIDGE CAB SAUV 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "086003091931",
    description: "ROBERT MONDAVI PINOT NOIR PRIV",
    qtyOnHand: 0,
  },
  {
    sku: "088004144678",
    description: "FIREBALL RED HOT",
    qtyOnHand: 24,
  },
  {
    sku: "089540448978",
    description: "MALIBU ORIGNAL 100 CL",
    qtyOnHand: 36,
  },
  {
    sku: "09556592482225",
    description: "DAVINCHI PUMP 10ML -034",
    qtyOnHand: 500,
  },
  {
    sku: "30021662",
    description: "REMY MARTIN VSOP 5L",
    qtyOnHand: 1080,
  },
  {
    sku: "3012993031975",
    description: "CH. Molin De Prayer 75cl",
    qtyOnHand: 0,
  },
  {
    sku: "3012993038899",
    description: "LAMOTH PARROT RESERVA*12",
    qtyOnHand: 0,
  },
  {
    sku: "3012993041677",
    description: "CH. GRAND SOUSSANS *12",
    qtyOnHand: 0,
  },
  {
    sku: "3012993046276",
    description: "LONGCHAMPS MERLOT *12",
    qtyOnHand: 48,
  },
  {
    sku: "3012993046313",
    description: "LONGCHAMPS CHARDONNAY *12",
    qtyOnHand: 0,
  },
  {
    sku: "3012993046351",
    description: "LONGCHAMPS CAB SAVU *12",
    qtyOnHand: 0,
  },
  {
    sku: "3012993059498",
    description: "CH DE GARBES",
    qtyOnHand: 0,
  },
  {
    sku: "3012993059504",
    description: "SIR EDWARDS'S SMOKY 100 CL",
    qtyOnHand: 24,
  },
  {
    sku: "3024480002191",
    description: "LOUIS XIII DE REMY MARTIN",
    qtyOnHand: 3,
  },
  {
    sku: "3024480004522",
    description: "REMY MARTIN XO 70 cl",
    qtyOnHand: 0,
  },
  {
    sku: "3024480006472",
    description: "REMY MARTIN XO 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3024482270123",
    description: "REMY MARTIN VSOP 70 CL",
    qtyOnHand: 368,
  },
  {
    sku: "3024482295126",
    description: "REMY MARTIN VSOP 100 CL",
    qtyOnHand: 42,
  },
  {
    sku: "3035542001908",
    description: "COINTREAU 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3035542004206",
    description: "COINTREAU 70 CL",
    qtyOnHand: 732,
  },
  {
    sku: "3047100090309",
    description: "PERNOD PARIS 100CL",
    qtyOnHand: 48,
  },
  {
    sku: "3049610004104",
    description: "VEUVE CLICQUOT BRUT 75 CL",
    qtyOnHand: 6,
  },
  {
    sku: "3052911148415",
    description: "EMO TRIPLE CURACAO 38% 70 CL",
    qtyOnHand: 721,
  },
  {
    sku: "3119460003272",
    description: "SPARKLING JAU *6",
    qtyOnHand: 0,
  },
  {
    sku: "3119460005603",
    description: "JAJA DE JAU SAUV *6",
    qtyOnHand: 0,
  },
  {
    sku: "3132590089602",
    description: "PASTIS JEAN CANON 1LIT",
    qtyOnHand: 240,
  },
  {
    sku: "3147690025702",
    description: "LABEL 5 BLENDED 1LIT",
    qtyOnHand: 36,
  },
  {
    sku: "31476900599103",
    description: "GIBSON'S GIN 100CL",
    qtyOnHand: 0,
  },
  {
    sku: "3163937010003",
    description: "RICARD PASTIS DE MARSEILLE 1LI",
    qtyOnHand: 0,
  },
  {
    sku: "3185370000335",
    description: "MOET BRUT 75 CL",
    qtyOnHand: 1060,
  },
  {
    sku: "3185370068441",
    description: "MOET NECTAR 75 CL",
    qtyOnHand: 12,
  },
  {
    sku: "3185370074831",
    description: "MOET & CHANDON ROSE  75CL",
    qtyOnHand: 0,
  },
  {
    sku: "3185370457054",
    description: "MOET & CHANDON ICE IMPERIAL 75",
    qtyOnHand: 45,
  },
  {
    sku: "3185370564721",
    description: "DOM PERIGNON BRUT 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3219820000054",
    description: "MARTELL VS 100 CL",
    qtyOnHand: 6,
  },
  {
    sku: "3219820000078",
    description: "MARTELL VS70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3219820005868",
    description: "MARTELL VSOP 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3232590089602",
    description: "PASTIS JEAN",
    qtyOnHand: 0,
  },
  {
    sku: "3245990001218",
    description: "HENNESSY XO EXTRA OLD 70 CL",
    qtyOnHand: 228,
  },
  {
    sku: "324599001218",
    description: "HENNESSY XO EXTRA OLD 70 CL*3",
    qtyOnHand: 0,
  },
  {
    sku: "3245990117117",
    description: "HENNESSY XO  100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3245990255215",
    description: "HENNESY VS 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3245990987611",
    description: "hennessy vsop 100 cl",
    qtyOnHand: 0,
  },
  {
    sku: "3245995960015",
    description: "HENNESSY VS 70 CL",
    qtyOnHand: 233,
  },
  {
    sku: "3245996126311",
    description: "HENNESSY PARADISE RARE 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3249990009960",
    description: "CHAPELLE DE LA TRINITE 1.5 L",
    qtyOnHand: 0,
  },
  {
    sku: "3249990039356",
    description: "RIVAGE VDUE ROUGE",
    qtyOnHand: 42,
  },
  {
    sku: "3269555851780",
    description: "MAISON GAUTIER 1755 EXTRA 70 C",
    qtyOnHand: 0,
  },
  {
    sku: "3270040009906",
    description: "JEAN DES VIGNES  RED 75 CL",
    qtyOnHand: 25,
  },
  {
    sku: "3270049122026",
    description: "JEAN DES VIGNES WHITE 2023 75",
    qtyOnHand: 24,
  },
  {
    sku: "3324651371010",
    description: "LAMOTH PARROT WHITE *12",
    qtyOnHand: 0,
  },
  {
    sku: "3324651372017",
    description: "LAMOTHE PARROT RED *12",
    qtyOnHand: 0,
  },
  {
    sku: "3324654029017",
    description: "LONGCHAMPS DOC WHITE",
    qtyOnHand: 12,
  },
  {
    sku: "3391180019317",
    description: "BELLARUCHE",
    qtyOnHand: 270,
  },
  {
    sku: "3391180020610",
    description: "PETITE RUCHE",
    qtyOnHand: 42,
  },
  {
    sku: "3430560010923",
    description: "FAIM DE LOUP SYRAH  75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3438980200023",
    description: "CH CEDRE D'ARTHUS *6",
    qtyOnHand: 0,
  },
  {
    sku: "3500610108501",
    description: "JP. CHENET ICE EDITION DEMI-SE",
    qtyOnHand: 42,
  },
  {
    sku: "3500610110238",
    description: "J.P CHENET ICE EDITION ROSE",
    qtyOnHand: 23,
  },
  {
    sku: "3500610122378",
    description: "J.P. CHENET APPLE",
    qtyOnHand: 0,
  },
  {
    sku: "3500610134432",
    description: "JP. CHENET MUSCAT DEMI- SEC",
    qtyOnHand: 0,
  },
  {
    sku: "3500610135736",
    description: "JP. CHENET CHARDONNAY BRUT",
    qtyOnHand: 0,
  },
  {
    sku: "3500610135743",
    description: "JP. CHENET PINOT NOIR ROSE",
    qtyOnHand: 16,
  },
  {
    sku: "3518690000028",
    description: "CH. VITALLIS SAINT - VERAN",
    qtyOnHand: 0,
  },
  {
    sku: "3560751810015",
    description: "CH. DE HAUX 2018 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3661419118204",
    description: "CH. TALBOT 2018 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "3666140026804",
    description: "WHISPERING ANGEL ROSE 75 CL",
    qtyOnHand: 414,
  },
  {
    sku: "3701273700068",
    description: "FOLIE ROUGE MALBEC",
    qtyOnHand: 24,
  },
  {
    sku: "3760068130220",
    description: "CH. CAMOLONG SAINTE LEONIE 75",
    qtyOnHand: 0,
  },
  {
    sku: "3760091712936",
    description: "CH. LAMARSALLE*6",
    qtyOnHand: 42,
  },
  {
    sku: "3760235260064",
    description: "CH. GABARON *6",
    qtyOnHand: 0,
  },
  {
    sku: "3760235981945",
    description: "CH. MALESCASSE",
    qtyOnHand: 30,
  },
  {
    sku: "3770009823098",
    description: "CH. CASTAGNAC 2018 FRONSAC",
    qtyOnHand: 0,
  },
  {
    sku: "3890000781095",
    description: "BELUGA NOBLE VODKA 1LIT",
    qtyOnHand: 0,
  },
  {
    sku: "3890000781125",
    description: "BELUGA NOBLE VODKA 3LIT",
    qtyOnHand: 0,
  },
  {
    sku: "4062400157704",
    description: "SIERRA TEQUILLA BLANCO 1L",
    qtyOnHand: 0,
  },
  {
    sku: "4062400543002",
    description: "SIERRA TEQUILA REPOSADO 1LIT",
    qtyOnHand: 0,
  },
  {
    sku: "4067700013002",
    description: "JAGERMEISTER 100 CL",
    qtyOnHand: 1584,
  },
  {
    sku: "406770001300222",
    description: "JAGERMESTER SEB 1L *6",
    qtyOnHand: 4,
  },
  {
    sku: "42213277",
    description: "MONKEY 47 SCHWARZWALD DR",
    qtyOnHand: 114,
  },
  {
    sku: "4603928005865",
    description: "BELUGA NOBEL WITH GLASS 1LIT",
    qtyOnHand: 0,
  },
  {
    sku: "4740050004967",
    description: "CRAFTER'S AROMATIC FLOWER GIN",
    qtyOnHand: 12,
  },
  {
    sku: "4750021000805",
    description: "STOLI ELIT 100CL",
    qtyOnHand: 10,
  },
  {
    sku: "475002100133",
    description: "STOLICHNAYA PREMIUM 50 CL",
    qtyOnHand: 1060,
  },
  {
    sku: "475002100157",
    description: "STOLICHNAYA PREMIUM 75 CL",
    qtyOnHand: 491,
  },
  {
    sku: "475002100164",
    description: "STOLICHNAYA PREMIUM 100 CL",
    qtyOnHand: 515,
  },
  {
    sku: "4750021002724",
    description: "STOLICHNAYA PREMIUM 37 CL",
    qtyOnHand: 564,
  },
  {
    sku: "4901777020313",
    description: "THE YAMAZAKI AGED 12 YEARS",
    qtyOnHand: 0,
  },
  {
    sku: "5000277005123",
    description: "DEWAR'S AGED 18 Y 1L",
    qtyOnHand: 0,
  },
  {
    sku: "5000281003603",
    description: "DALWHINNIE 15 YEARS 1 LIT",
    qtyOnHand: 6,
  },
  {
    sku: "5000299211243",
    description: "ROYAL SALUTE 21 Y 70 CL",
    qtyOnHand: 4,
  },
  {
    sku: "5000299225028",
    description: "CHIVAS REGAL 18Y 75 CL",
    qtyOnHand: 18,
  },
  {
    sku: "5000299255049",
    description: "CHIVAS REGAL 18Y 100 CL",
    qtyOnHand: 834,
  },
  {
    sku: "5000299609897",
    description: "THE GLENLIVET FOUNDER 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5000299618042",
    description: "BEEFEATER PINK GIN 100 CL",
    qtyOnHand: 432,
  },
  {
    sku: "5000299621233",
    description: "GLENLIVET CAPTAINS 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5000329002278",
    description: "BEEFEATER DRY GIN",
    qtyOnHand: 1886,
  },
  {
    sku: "5000329002322",
    description: "BEEFATER GIN 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010019640260",
    description: "LAPHROAIG AGED 10 YEARS 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010093210007",
    description: "TEACHER'S HIGHLAND CREAM 1LIT",
    qtyOnHand: 12,
  },
  {
    sku: "5010134912310",
    description: "MUD HOUSE NEW ZEALAND SAU BLAN",
    qtyOnHand: 0,
  },
  {
    sku: "5010134916677",
    description: "KUMALA SHIRAZ 2023 75 CL",
    qtyOnHand: 162,
  },
  {
    sku: "5010134916684",
    description: "KUMALA PINOTAGE 2018",
    qtyOnHand: 150,
  },
  {
    sku: "5010134916707",
    description: "KUMALA CHARDONNAY 2023 75 CL",
    qtyOnHand: 150,
  },
  {
    sku: "5010196111010",
    description: "DALMORE AGED 12Y  70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010278100727",
    description: "JIMBEAM APPLE 1LIT",
    qtyOnHand: 24,
  },
  {
    sku: "5010278100789",
    description: "JIM BEAM BOURBON 1L",
    qtyOnHand: 0,
  },
  {
    sku: "5010314101015",
    description: "THE FAMOUS",
    qtyOnHand: 36,
  },
  {
    sku: "5010314301712",
    description: "MACALLAN RARE CASK 2023 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010314302467",
    description: "MACALLAN RARE CASK BLACK 70 CL",
    qtyOnHand: 15,
  },
  {
    sku: "5010314302863",
    description: "THE MACALLAN 12Y DOUBLE CASK",
    qtyOnHand: 44,
  },
  {
    sku: "5010314305109",
    description: "MACALLAN QUEST 1LIT",
    qtyOnHand: 33,
  },
  {
    sku: "5010314305116",
    description: "THE MACALLAN LUMINA 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010314305130",
    description: "MACALLAN ENIGMA 70 CL",
    qtyOnHand: 5,
  },
  {
    sku: "5010314309879",
    description: "MACALLAN DOUBLE CASK 18Y 75CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010327000497",
    description: "GRANTS TRIPLE WOOD 100CL",
    qtyOnHand: 4277,
  },
  {
    sku: "5010327015859",
    description: "GLENFIDDICH GRAND AGE 23Y",
    qtyOnHand: 0,
  },
  {
    sku: "5010327025155",
    description: "GLENFIDDICH 12Y TRIPLE OAK TWE",
    qtyOnHand: 0,
  },
  {
    sku: "5010327302201",
    description: "GLENFIDDICH 12 YEARS 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010327324081",
    description: "GLENFIDDICH 21 YEARS 70 CL",
    qtyOnHand: 56,
  },
  {
    sku: "5010327325323",
    description: "GLENFIDDICH 18Y 70 CL",
    qtyOnHand: 1254,
  },
  {
    sku: "5010327325330",
    description: "GLENFIDDICH PROJECT XX 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010327363219",
    description: "GLENFIDDICH 15 Y 100 CL",
    qtyOnHand: 1371,
  },
  {
    sku: "5010327375311",
    description: "GLENFIDDICH GRAND YOZAKURA AGE",
    qtyOnHand: 0,
  },
  {
    sku: "5010327375557",
    description: "GLENFIDDICH AGED 40 Y 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5010327505138",
    description: "THE BALVENIE 12Y 70CL",
    qtyOnHand: 54,
  },
  {
    sku: "5010327603056",
    description: "MONKEY SHOULDER 1L",
    qtyOnHand: 138,
  },
  {
    sku: "5010327604008",
    description: "BALVENIE AGED 21 YEARS 70 CL",
    qtyOnHand: 15,
  },
  {
    sku: "5010327703053",
    description: "HENDRICKS GIN 100 CL",
    qtyOnHand: 814,
  },
  {
    sku: "5010391101007",
    description: "DRAMBUIE 1L",
    qtyOnHand: 24,
  },
  {
    sku: "5010494560121",
    description: "GLENMORANGIE AGE 10 YEARS 1LIT",
    qtyOnHand: 0,
  },
  {
    sku: "5010677015738",
    description: "BACARDI WHITE 100 CL",
    qtyOnHand: 872,
  },
  {
    sku: "5010677025812",
    description: "BACARDI GOLD 100 CL",
    qtyOnHand: 144,
  },
  {
    sku: "5010677038935",
    description: "BACARDI CARTA NEGRA 1LIT",
    qtyOnHand: 12,
  },
  {
    sku: "5010677716000",
    description: "BOMBAY SAPPHIRE 1LIT",
    qtyOnHand: 48,
  },
  {
    sku: "5010677915007",
    description: "MARTINI ROSSO 100 CL",
    qtyOnHand: 53,
  },
  {
    sku: "5010677925006",
    description: "MARTINI BIANCO 100 CL",
    qtyOnHand: 54,
  },
  {
    sku: "5010677945004",
    description: "MARTINI ROSATO",
    qtyOnHand: 48,
  },
  {
    sku: "501067795005",
    description: "MARTINI EXTRA DRY 100 CL",
    qtyOnHand: 333,
  },
  {
    sku: "5011007003227",
    description: "JAMSON IRISH WHISKEY 100 CL",
    qtyOnHand: 4313,
  },
  {
    sku: "5011007025083",
    description: "JAMESON BLACK BARREL 75CL",
    qtyOnHand: 0,
  },
  {
    sku: "5011013100118",
    description: "BAILEYS IRISH CREAM 1L",
    qtyOnHand: 1182,
  },
  {
    sku: "5011026108019",
    description: "TULLAMORE DEW 1L",
    qtyOnHand: 18,
  },
  {
    sku: "5012523231958",
    description: "TIA MARIA 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5013626111222",
    description: "TAYLOR'S FINE TAWNY PORT 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5013967012486",
    description: "JURA AGED 10 YEARS 70 CL",
    qtyOnHand: 4,
  },
  {
    sku: "5013967014633",
    description: "JURA AGED 10 YEARS WITH GLASS",
    qtyOnHand: 0,
  },
  {
    sku: "5013967017054",
    description: "DALMORE KING ALEXANDER 3",
    qtyOnHand: 0,
  },
  {
    sku: "5013967018228",
    description: "DALMORE AGED 21Y 70 CL 2024 ED",
    qtyOnHand: 6,
  },
  {
    sku: "5013967019324",
    description: "DALMORE AGED 18Y 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5016840000617",
    description: "HIGH COMMISSIONER 1L",
    qtyOnHand: 0,
  },
  {
    sku: "5055807400596",
    description: "THE BOTANIST DRY GIN 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5055807401883",
    description: "THE BOTANIST DRY GIN 100 CL",
    qtyOnHand: 36,
  },
  {
    sku: "5060030081214",
    description: "MASIA J SAUVIGNON BLANC 2023 7",
    qtyOnHand: 0,
  },
  {
    sku: "5060030081238",
    description: "MASIA J MERLOT 75 CL",
    qtyOnHand: 96,
  },
  {
    sku: "5060030081252",
    description: "MASIA J TEMPRANILLO 2023",
    qtyOnHand: 0,
  },
  {
    sku: "5060165353729",
    description: "BLACKBULL 12 YEARS 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5060204340864",
    description: "SIPSMMITH LONDON DRY GIN",
    qtyOnHand: 13,
  },
  {
    sku: "5060294560951",
    description: "SMOKIN 70 CL",
    qtyOnHand: 6,
  },
  {
    sku: "5060294564188",
    description: "BLACKBULL 70 CL",
    qtyOnHand: 120,
  },
  {
    sku: "5060294565376",
    description: "INDIA SUMMER 70 CL",
    qtyOnHand: 66,
  },
  {
    sku: "5099873006369",
    description: "JACK DANIELS FIRE 1L",
    qtyOnHand: 0,
  },
  {
    sku: "5099873011737",
    description: "JACK DANIEL'S REY",
    qtyOnHand: 0,
  },
  {
    sku: "5392000109865",
    description: "EXTRA DRY GIN",
    qtyOnHand: 0,
  },
  {
    sku: "5601012011500",
    description: "MATEUS THE ORIGINAL ROSE  75CL",
    qtyOnHand: 168,
  },
  {
    sku: "5604575000479",
    description: "CABRIZ RESERVA 2018 75 CL",
    qtyOnHand: 84,
  },
  {
    sku: "5901041003164",
    description: "BELVEDERE VODKA 3LIT",
    qtyOnHand: 0,
  },
  {
    sku: "5901041003409",
    description: "BELVEDER 6 LIT",
    qtyOnHand: 0,
  },
  {
    sku: "59010441003362",
    description: "BELEVEDER 100 CL",
    qtyOnHand: 433,
  },
  {
    sku: "60001495062669",
    description: "AMARULA CREAM 100 CL",
    qtyOnHand: 1705,
  },
  {
    sku: "60001495201600",
    description: "DROSTDY HOF CLARET MIDIUM DRY",
    qtyOnHand: 0,
  },
  {
    sku: "60002269004663",
    description: "TANGLED TREE CHOCOLA CAB SAU3L",
    qtyOnHand: 204,
  },
  {
    sku: "60003643009977",
    description: "CHARLES LANG SONS MERLOT 75CL",
    qtyOnHand: 54,
  },
  {
    sku: "60009602547863",
    description: "ANTICA SWEET RED 75 CL",
    qtyOnHand: 15025,
  },
  {
    sku: "60009602547887",
    description: "ANTICA SWEET WHITE 75CL",
    qtyOnHand: 240,
  },
  {
    sku: "600096025478877",
    description: "ANTICA DRY RED 75 CL",
    qtyOnHand: 8215,
  },
  {
    sku: "60009705030187",
    description: "BAYEDE THE KING SHIRAZ 75 CL",
    qtyOnHand: 174,
  },
  {
    sku: "6001452258005",
    description: "NEDERBURG SAUV BLANC 2024",
    qtyOnHand: 138,
  },
  {
    sku: "6001452301862",
    description: "NEDERBURG CAB  SAUVIGN 2020",
    qtyOnHand: 30,
  },
  {
    sku: "6001452303873",
    description: "NEDERBURG PINOTAGE 2022",
    qtyOnHand: 55,
  },
  {
    sku: "6001452325899",
    description: "NEDERBURG CHardonnay 75 cl",
    qtyOnHand: 60,
  },
  {
    sku: "6001452371506",
    description: "NEDERBURG SHIRAZ 2022 75 CL",
    qtyOnHand: 120,
  },
  {
    sku: "6001495203116",
    description: "DROSTDY HOF DRY WHITE 5L",
    qtyOnHand: 12,
  },
  {
    sku: "6002039005753",
    description: "ROBERTSON WINERY",
    qtyOnHand: 0,
  },
  {
    sku: "6002039007665",
    description: "THE CHOCOLATE BLOCK 75 CL",
    qtyOnHand: 46,
  },
  {
    sku: "6002123103006",
    description: "SIMONSIG STARTING BLOOCKS BLAN",
    qtyOnHand: 0,
  },
  {
    sku: "6002269004274",
    description: "THE COFFEE POT PINOTAGE 75 CL",
    qtyOnHand: 402,
  },
  {
    sku: "6002269004328",
    description: "FIVE'S RESERVE CAB SAUVI 3L",
    qtyOnHand: 232,
  },
  {
    sku: "6002269004670",
    description: "TANGLED TREE TROPIC SAU BLC 3L",
    qtyOnHand: 172,
  },
  {
    sku: "6002269004687",
    description: "TANGLED TREE SPICY SHIRAZ 3LIT",
    qtyOnHand: 168,
  },
  {
    sku: "6002269004694",
    description: "TANGLED TREE BUTTER CHARDO 3L",
    qtyOnHand: 144,
  },
  {
    sku: "6002269006247",
    description: "CAPE AUCTION COLOMBAR 75 CL",
    qtyOnHand: 750,
  },
  {
    sku: "6002269006254",
    description: "CAPE AUCTION CAB SAUV 75 CL",
    qtyOnHand: 1032,
  },
  {
    sku: "600343009892",
    description: "CHARLES LANG PINOTAGE 75CL",
    qtyOnHand: 54,
  },
  {
    sku: "6003643009878",
    description: "CHARLES LANG SONS SHIRAZ 75CL",
    qtyOnHand: 54,
  },
  {
    sku: "6003643009892",
    description: "CHARLES LANG SONS PINTAGE 75CL",
    qtyOnHand: 0,
  },
  {
    sku: "6003643009953",
    description: "CHARLES LANG CAB SAUVIGON 75CL",
    qtyOnHand: 66,
  },
  {
    sku: "6003643009991",
    description: "CHARLES LANG  SAUV BLANC N75CL",
    qtyOnHand: 54,
  },
  {
    sku: "600364309953",
    description: "CHARLES LANG CAB SAUVIGNON75CL",
    qtyOnHand: 0,
  },
  {
    sku: "600444200179",
    description: "NAMAQUA SMOOTH DRY RED 3L",
    qtyOnHand: 20,
  },
  {
    sku: "600444201018",
    description: "NAMAQUA BLANC DE BLANC 3L",
    qtyOnHand: 0,
  },
  {
    sku: "60096025478877",
    description: "ANTICA DRY WHITE 75 CL",
    qtyOnHand: 149,
  },
  {
    sku: "6009602547900",
    description: "ANTICA SWEET ROSE 75 CL",
    qtyOnHand: 42,
  },
  {
    sku: "6009605834205",
    description: "CAPE AUCTION  CLASSIC RED 5L",
    qtyOnHand: 139,
  },
  {
    sku: "6009605834304",
    description: "CAPE AUCTION CLASSIC WHIT 5L",
    qtyOnHand: 56,
  },
  {
    sku: "6009605834311",
    description: "CAPE AUCTION SWEET ROSE 5L",
    qtyOnHand: 0,
  },
  {
    sku: "6009605839002",
    description: "BEACON HILL SAUV BLANC 75 CL",
    qtyOnHand: 240,
  },
  {
    sku: "6009615620522",
    description: "darling cab sauvignon 2023 75",
    qtyOnHand: 102,
  },
  {
    sku: "6009615620546",
    description: "DARLING BLACK GRANI SHIRAZ 75C",
    qtyOnHand: 108,
  },
  {
    sku: "6009615620560",
    description: "DARLING 6TONNER MERLOT 75 CL",
    qtyOnHand: 120,
  },
  {
    sku: "6009615620584",
    description: "DARLING SAUV BLANC 75 CL",
    qtyOnHand: 168,
  },
  {
    sku: "6009615621734",
    description: "DARLING CHENIN BLANC 75 CL",
    qtyOnHand: 168,
  },
  {
    sku: "600961582057",
    description: "DARLING BUSH CAB SAUV 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "6009650561996",
    description: "FISH HOEK PINOTAGE 2023 75 CL",
    qtyOnHand: 72,
  },
  {
    sku: "6009650562030",
    description: "FISH HOEK CHENIN BLANC 2023 75",
    qtyOnHand: 54,
  },
  {
    sku: "6009705030743",
    description: "BAYEDE B ROYAL CHENI BLC 75 CL",
    qtyOnHand: 798,
  },
  {
    sku: "6009705030767",
    description: "BAYEDE B ROYAL PINOTAGE 75 CL",
    qtyOnHand: 524,
  },
  {
    sku: "6009705031450",
    description: "BAYEDE B ROYAL SWEET RED 75 CL",
    qtyOnHand: 426,
  },
  {
    sku: "6009801167039",
    description: "KANONKOP KADETTE CAPE BLEND 20",
    qtyOnHand: 12,
  },
  {
    sku: "6009802168042",
    description: "THE KING BAYEDE JUBLEE 75 CL",
    qtyOnHand: 234,
  },
  {
    sku: "6009802168196",
    description: "BAYEDE CAB SAUV 75 CL",
    qtyOnHand: 1026,
  },
  {
    sku: "6009802168332",
    description: "BAYEDE MERLOT  75 CL",
    qtyOnHand: 1080,
  },
  {
    sku: "6009811000852",
    description: "CHARLES LANG  CAB SAU RUBY75CL",
    qtyOnHand: 0,
  },
  {
    sku: "619947000013",
    description: "TITO,S VODKA 100 CL",
    qtyOnHand: 120,
  },
  {
    sku: "721733002634",
    description: "PATRON SILVER 100CL",
    qtyOnHand: 0,
  },
  {
    sku: "721733005512",
    description: "PATRON ANEJO 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "721733005857",
    description: "PATRON EL ALTO  1.5 L",
    qtyOnHand: 0,
  },
  {
    sku: "725765058508",
    description: "RIFT VALLEY MALBEC",
    qtyOnHand: 516,
  },
  {
    sku: "7312040017034",
    description: "ABSOLUTE BLUE 100CL",
    qtyOnHand: 9336,
  },
  {
    sku: "7501012914611",
    description: "CAMINO GOLD 75 CL",
    qtyOnHand: 1338,
  },
  {
    sku: "7501012916127",
    description: "CAMINO SILVER 75 CL",
    qtyOnHand: 1710,
  },
  {
    sku: "7501035010093",
    description: "JOSE CUERVO GOLD 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "7501035013124",
    description: "1800 REPOSADO 70 CL",
    qtyOnHand: 7,
  },
  {
    sku: "7501035042315",
    description: "JOSE CURVO SILVER 100 CL",
    qtyOnHand: 1134,
  },
  {
    sku: "7610113001455",
    description: "BACARDI ANEJO CUATRO 1LIT",
    qtyOnHand: 18,
  },
  {
    sku: "7610113007495",
    description: "BACARDI SPICED 1LIT",
    qtyOnHand: 18,
  },
  {
    sku: "7610594251950",
    description: "KAHLUA COFFEE 100 CL",
    qtyOnHand: 64,
  },
  {
    sku: "7610594252162",
    description: "KAHLUA THE ORGINAL 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "7640171037363",
    description: "DEWAR'S AGED 15 Y DOUBEL AGED",
    qtyOnHand: 0,
  },
  {
    sku: "7790975003931",
    description: "TERRAZAS DELOS ANDES MALBEC",
    qtyOnHand: 0,
  },
  {
    sku: "7790975003955",
    description: "TERRAZAS DE LOS ANDES CAB SAV",
    qtyOnHand: 6,
  },
  {
    sku: "7790975003986",
    description: "TERRAZAS DE LOS ANDES CHARDONN",
    qtyOnHand: 138,
  },
  {
    sku: "7798130465594",
    description: "ANDES SOUL ARGENTO MALBEC 75 C",
    qtyOnHand: 60,
  },
  {
    sku: "7798130466515",
    description: "ANDES SOUL ARGENTO SYRAH 75 CL",
    qtyOnHand: 210,
  },
  {
    sku: "7804320087016",
    description: "CASILLERO DEL DIABLO CARMENERE",
    qtyOnHand: 126,
  },
  {
    sku: "7804320256900",
    description: "CASILLERO DEL DIABLO CHARDONNA",
    qtyOnHand: 90,
  },
  {
    sku: "7804320303178",
    description: "CASILLERO DEL DIABLO CABERNET",
    qtyOnHand: 36,
  },
  {
    sku: "7804320510170",
    description: "CASILLERO DEL DIABLO SHIRAZ  2",
    qtyOnHand: 102,
  },
  {
    sku: "8000040500081",
    description: "WILD TURKEY 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "8000160686375",
    description: "TERESA RIZZI PROSECCO BRUT 75C",
    qtyOnHand: 0,
  },
  {
    sku: "8000330001175",
    description: "AMARO MONTENEGRO 1L",
    qtyOnHand: 0,
  },
  {
    sku: "80004400013181",
    description: "FERNET BRANCA 100 CL",
    qtyOnHand: 0,
  },
  {
    sku: "8000570435402",
    description: "Martini asti 75 cl",
    qtyOnHand: 0,
  },
  {
    sku: "8000570484004",
    description: "MARTINI ROSE DEMI - SEC",
    qtyOnHand: 18,
  },
  {
    sku: "8002230000012",
    description: "APEROL 1919 1LIT",
    qtyOnHand: 301,
  },
  {
    sku: "8002235007337",
    description: "CASTELLO DI ALBOLA CHIANTI 22",
    qtyOnHand: 0,
  },
  {
    sku: "8002235020060",
    description: "BORGO SANLEO CHIANTI 2021",
    qtyOnHand: 0,
  },
  {
    sku: "8002235022965",
    description: "ZINZULA ROSE 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "8002235750851",
    description: "ZONIN AMARONE DELLA VALPOLICEL",
    qtyOnHand: 1,
  },
  {
    sku: "8002235835053",
    description: "ZONIN PRO D.O.C ITALIA 75CL",
    qtyOnHand: 0,
  },
  {
    sku: "8002477173715",
    description: "SENSI CAMPOLUCE CHIANTI 2021",
    qtyOnHand: 0,
  },
  {
    sku: "8003405007478",
    description: "ROBERTO CAVALI ORANGE",
    qtyOnHand: 60,
  },
  {
    sku: "8003405007485",
    description: "ROBERTO CAVALI ROSEMARY",
    qtyOnHand: 42,
  },
  {
    sku: "8003905040289",
    description: "AST. PURO MERLOT",
    qtyOnHand: 102,
  },
  {
    sku: "8003905040517",
    description: "AST. FASHION VICTIM CUVVE 75CL",
    qtyOnHand: 24,
  },
  {
    sku: "8004400001003",
    description: "FERNET BRANCA 100 CL",
    qtyOnHand: 1642,
  },
  {
    sku: "8004747007461",
    description: "ANTICA SAMBUCA WITH LIQ 70 CL",
    qtyOnHand: 306,
  },
  {
    sku: "8004747009441",
    description: "ANTICA SAMBUCA CLASSIC 100 CL",
    qtyOnHand: 1452,
  },
  {
    sku: "8005829222055",
    description: "PRONOL SAMBUCA 70 CL",
    qtyOnHand: 1667,
  },
  {
    sku: "8005829230524",
    description: "BOTTEGA AMARONE DELLA VALPOLIC",
    qtyOnHand: 24,
  },
  {
    sku: "8005829231521",
    description: "BOTTEGA AMARONE DELLA VAL RISE",
    qtyOnHand: 40,
  },
  {
    sku: "8005829233334",
    description: "BOTTEGA GOLD 3L",
    qtyOnHand: 5,
  },
  {
    sku: "8005829240042",
    description: "BOTTEGA ROSE PARTY",
    qtyOnHand: 0,
  },
  {
    sku: "800582980269",
    description: "BOTTEGA STARDUST 1.5L",
    qtyOnHand: 10,
  },
  {
    sku: "8005829979362",
    description: "BOTTEGA ROSE GOLD 1.5 LIT",
    qtyOnHand: 10,
  },
  {
    sku: "8005829980153",
    description: "BOTTEGA STARDUST 3L",
    qtyOnHand: 4,
  },
  {
    sku: "8005829980733",
    description: "BOTTEGA GOLD AND ROSE 200ML",
    qtyOnHand: 2256,
  },
  {
    sku: "8005829981617",
    description: "BOTTEGA COLLIO DOC PINOT",
    qtyOnHand: 0,
  },
  {
    sku: "80058299831780",
    description: "BOTTEGA LL VINO DELL MOSCATO",
    qtyOnHand: 54,
  },
  {
    sku: "8005829988609",
    description: "BOTTEGA NEGRON PREMIX 70 CL",
    qtyOnHand: 6,
  },
  {
    sku: "8005829989200",
    description: "BOTTEGA WHITE 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "8008900005387",
    description: "TERRE AFFEGRE SANGIOVESE 75 CL",
    qtyOnHand: 6,
  },
  {
    sku: "8008900005394",
    description: "TERRE AFFEGRE TREBBIANO 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "80096630088570",
    description: "FANTINEL TESIS SAUV DOC FRLUU",
    qtyOnHand: 108,
  },
  {
    sku: "8009663085289",
    description: "FANTINEL CANB SAUV BORGA FESES",
    qtyOnHand: 192,
  },
  {
    sku: "8009663085302",
    description: "FANTINEL PINOT GRIGIO BORGA FE",
    qtyOnHand: 228,
  },
  {
    sku: "8009663088037",
    description: "FANTINEL ONE AND ONLY ROSE BRU",
    qtyOnHand: 204,
  },
  {
    sku: "8009663088518",
    description: "FANTINEL VENKO RED  BLED",
    qtyOnHand: 60,
  },
  {
    sku: "8009663088570",
    description: "BORGO TESIS  SAUV FRLUU 75 CL",
    qtyOnHand: 36,
  },
  {
    sku: "8009663088679",
    description: "FANTINEL CUV PRE BRUT",
    qtyOnHand: 294,
  },
  {
    sku: "8009663089102",
    description: "FANTINEL ONE$ ONLY PRO BRUT",
    qtyOnHand: 264,
  },
  {
    sku: "8009663101071",
    description: "FANTINEL JUDRI SAUV 75 CL",
    qtyOnHand: 66,
  },
  {
    sku: "8009663101088",
    description: "FANTINEL ROC PINOT GRIGIO 2020",
    qtyOnHand: 0,
  },
  {
    sku: "80096631050048",
    description: "FANTINEL EXTRA DRY PRO 75CL",
    qtyOnHand: 0,
  },
  {
    sku: "8009663105048",
    description: "FANTINEL PRO DOC EXTRA DRY",
    qtyOnHand: 0,
  },
  {
    sku: "8010471000203",
    description: "ARALDICA PIEMONTE BARBERA 75 C",
    qtyOnHand: 0,
  },
  {
    sku: "8043240043",
    description: "CHIVAS REGAL 12 YEARS 100 CL",
    qtyOnHand: 1149,
  },
  {
    sku: "80480280017",
    description: "GREY GOOSE BLUE 100 CL",
    qtyOnHand: 364,
  },
  {
    sku: "8059306000223",
    description: "ROBERTO CAVALLI VODKA SILVER 1",
    qtyOnHand: 0,
  },
  {
    sku: "811751020601",
    description: "STOLI ELIT 75 CL",
    qtyOnHand: 4,
  },
  {
    sku: "82184090442",
    description: "JACK DANEL NO 7 100 CL",
    qtyOnHand: 559,
  },
  {
    sku: "8336206001240",
    description: "DARLING OLD BUSH CHENIN 75 CL",
    qtyOnHand: 54,
  },
  {
    sku: "836206000724",
    description: "SIR CHARLES 75 CL",
    qtyOnHand: 246,
  },
  {
    sku: "836206001226",
    description: "DARLING OLD BUSH CINSAUT 2019",
    qtyOnHand: 136,
  },
  {
    sku: "836206001240",
    description: "DARLING OLD BUSH BLANC 2019",
    qtyOnHand: 156,
  },
  {
    sku: "836206002391",
    description: "CHOCOHOLIC PINOTAGE 2022",
    qtyOnHand: 156,
  },
  {
    sku: "8410024700008",
    description: "MALIBU ORIG 100CL",
    qtyOnHand: 0,
  },
  {
    sku: "8410162100111",
    description: "FUNDADOR SHERRY BRANDY 1L",
    qtyOnHand: 0,
  },
  {
    sku: "8410310622717",
    description: "CASTILLO  LIRIA BLA BRUT 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "8411640000480",
    description: "GIN MARE 1L",
    qtyOnHand: 12,
  },
  {
    sku: "8716000964717",
    description: "BOLS PARFAIT AMOUR 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "8716000964922",
    description: "BOLS CREAM DE CASSIS",
    qtyOnHand: 0,
  },
  {
    sku: "8716000965066",
    description: "BOLS TRIPLE SEC 70 CL",
    qtyOnHand: 126,
  },
  {
    sku: "8716000965226",
    description: "BOLS BLUE CURACAO 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "8716000966353",
    description: "BOLS BUTTERSCOTCH 70 CL",
    qtyOnHand: 0,
  },
  {
    sku: "90162602",
    description: "RED BULL ENERGY DRINK 250ML",
    qtyOnHand: 12781,
  },
  {
    sku: "9300727003997",
    description: "JACOB,S CREE PINOT GRIGIO 2024",
    qtyOnHand: 60,
  },
  {
    sku: "9300727009418",
    description: "JACOB,S CREEK PINOT NOIR 2022",
    qtyOnHand: 0,
  },
  {
    sku: "9300727017635",
    description: "JACOB'S CREEK DOUBLE BSHIRAZ V",
    qtyOnHand: 0,
  },
  {
    sku: "9300727513007",
    description: "JACOB,S CREEK CAB SAU 2023",
    qtyOnHand: 12,
  },
  {
    sku: "9300727620019",
    description: "JACOB,S CREEK SPARKILING ROSE",
    qtyOnHand: 0,
  },
  {
    sku: "9300770043551",
    description: "WOLF BLASS EGLEHAWK CAB SAUVI",
    qtyOnHand: 0,
  },
  {
    sku: "9300770065720",
    description: "WOLF BLASS EGLEHAWK MERLOT",
    qtyOnHand: 0,
  },
  {
    sku: "9310297004928",
    description: "PENFOLDS FATHER TAWNY 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "9310297010523",
    description: "PENFOLDS MAX,S CHARDONNAY",
    qtyOnHand: 18,
  },
  {
    sku: "9310297010905",
    description: "PENFOLDS KOON SHIRAZ CABERNET",
    qtyOnHand: 0,
  },
  {
    sku: "9310297021772",
    description: "PENFOLD R.W.T SHIRAZ   BAROSSA",
    qtyOnHand: 6,
  },
  {
    sku: "9310297023639",
    description: "PENFOLDS BIN 128 COONAWEEA",
    qtyOnHand: 30,
  },
  {
    sku: "9310297028917",
    description: "PENFOLDS KOOUNGA HILL CHARDO",
    qtyOnHand: 24,
  },
  {
    sku: "9310297029754",
    description: "PENFOLDS ST HENRI SHIRAZ",
    qtyOnHand: 0,
  },
  {
    sku: "9310297032402",
    description: "PENFOLDS BIN 128 COON SHIRAZ",
    qtyOnHand: 0,
  },
  {
    sku: "9310297042906",
    description: "PENFOLDS BIN 2 SHIRAZ MATARO",
    qtyOnHand: 30,
  },
  {
    sku: "9311043000225",
    description: "HARDY'S NATTAGE HILL CAB SHIRA",
    qtyOnHand: 66,
  },
  {
    sku: "9311043000249",
    description: "HARDY'S NATTAGE HILL CHARDONNA",
    qtyOnHand: 78,
  },
  {
    sku: "9311043007743",
    description: "HARDY'S SHIRAZ CAB 2021",
    qtyOnHand: 0,
  },
  {
    sku: "9311043014901",
    description: "HARDY'S THE RIDDLE CAB MERLOT",
    qtyOnHand: 168,
  },
  {
    sku: "9311043015038",
    description: "HARDY'S THE RIDDLE SAUV BLANC",
    qtyOnHand: 504,
  },
  {
    sku: "9311043015403",
    description: "HARDY'S THE RIDDLE CHARDONNAY",
    qtyOnHand: 300,
  },
  {
    sku: "9311043024511",
    description: "HARDY'S CHARDONNAY SEMILLON",
    qtyOnHand: 792,
  },
  {
    sku: "9311043027390",
    description: "HARDY'S NATTAGE HILL SHIRAZ 20",
    qtyOnHand: 66,
  },
  {
    sku: "9311043049217",
    description: "HARDY'S CAB MERLOT 75 CL",
    qtyOnHand: 1164,
  },
  {
    sku: "9311043066047",
    description: "BANROCK STATION SAU BLANC",
    qtyOnHand: 54,
  },
  {
    sku: "9311220005005",
    description: "19 CRIMES SHIRAZ 75 CL",
    qtyOnHand: 18,
  },
  {
    sku: "9311789279596",
    description: "OXFORD LANDING CAB SAU SHIRAZ",
    qtyOnHand: 222,
  },
  {
    sku: "9311789563466",
    description: "OXFORD LANDING MERLOT 75 CL",
    qtyOnHand: 246,
  },
  {
    sku: "9312088005428",
    description: "WOLF BLASS BLACK LABEL",
    qtyOnHand: 0,
  },
  {
    sku: "9319020005577",
    description: "WHISTLING DUCK SHIRAZ 2024",
    qtyOnHand: 0,
  },
  {
    sku: "9319020005591",
    description: "WHISTLING DUCK CHARDONNAY 75 C",
    qtyOnHand: 174,
  },
  {
    sku: "9418408030016",
    description: "CLOUDY BAY SAV BLANC 2023 75CL",
    qtyOnHand: 684,
  },
  {
    sku: "9421018070709",
    description: "DUSKY SOUNDS SAU BLANC",
    qtyOnHand: 54,
  },
  {
    sku: "9506000024400",
    description: "RIFT VALLEY SYRAH 75 CL",
    qtyOnHand: 582,
  },
  {
    sku: "950600002441",
    description: "RIFT VALLY DRY ROSE 75 CL",
    qtyOnHand: 354,
  },
  {
    sku: "9506000024417",
    description: "RIFT VALLY CAB SAUVIGNON",
    qtyOnHand: 384,
  },
  {
    sku: "9506000024455",
    description: "ACACIA SWEET ROSE 75CL",
    qtyOnHand: 24,
  },
  {
    sku: "9506000024462",
    description: "ACACIA DRY RED 75 CL",
    qtyOnHand: 24,
  },
  {
    sku: "9506000024479",
    description: "ACACIA SWEET RED 75 CL",
    qtyOnHand: 833,
  },
  {
    sku: "9506000024486",
    description: "ACACIA SWEET WHITE",
    qtyOnHand: 0,
  },
  {
    sku: "9506000024493",
    description: "RIFT VALLEY CUV PRE CHA 75CL",
    qtyOnHand: 12,
  },
  {
    sku: "9506000142616",
    description: "CASTEL RIFT VALLEY CHENIN BLAN",
    qtyOnHand: 54,
  },
  {
    sku: "9551021070028",
    description: "DAVINCHI GOURMET PEACH TEA SYR",
    qtyOnHand: 180,
  },
  {
    sku: "9551021070073",
    description: "DAVINCHI GOURMET LEMON TEA SYR",
    qtyOnHand: 0,
  },
  {
    sku: "9555040805807",
    description: "DA VINCI JUICY LIME SYRUP",
    qtyOnHand: 0,
  },
  {
    sku: "9556592024784",
    description: "DAVINCHI GOURMET MIX BERRY FRU",
    qtyOnHand: 576,
  },
  {
    sku: "9556592129205",
    description: "DAVINCHI GOURMET POMELO SYRUP",
    qtyOnHand: 216,
  },
  {
    sku: "9556592166811",
    description: "DAVINCHI GOURMET COCONUT SYR",
    qtyOnHand: 288,
  },
  {
    sku: "9556592168198",
    description: "DAVINCHI GOURMET PUMPKIN SYRUP",
    qtyOnHand: 0,
  },
  {
    sku: "9556592513165",
    description: "DA VINCHI GRENADINE PMOE SYRUP",
    qtyOnHand: 372,
  },
  {
    sku: "9556592513172",
    description: "DA VINCI BLUE OCEAN SYRUP",
    qtyOnHand: 1488,
  },
  {
    sku: "9556592513196",
    description: "DAVINCHI MENTA CUBANO SYRUP",
    qtyOnHand: 1452,
  },
  {
    sku: "9556592513226",
    description: "DAVINCHI MADAGASCAR FLV SAU2L",
    qtyOnHand: 0,
  },
  {
    sku: "9556592513516",
    description: "DAVINCHI BUTTERSCOTCH FLV 2L",
    qtyOnHand: 0,
  },
  {
    sku: "9556592513530",
    description: "DAVINCHI CHOCOLATE FLV 2LIT",
    qtyOnHand: 258,
  },
  {
    sku: "9556592513578",
    description: "DA VINCHI CARAMEL SYRUP",
    qtyOnHand: 336,
  },
  {
    sku: "9556592513585",
    description: "DAVINCHI HAZELNUT SYRUP",
    qtyOnHand: 492,
  },
  {
    sku: "9556592513592",
    description: "DA VINCHI STRAWBEERY SYRUP",
    qtyOnHand: 0,
  },
  {
    sku: "9556592513615",
    description: "DA VINCHI VANILLA SYRUP",
    qtyOnHand: 420,
  },
  {
    sku: "9556592529128",
    description: "DAVINCHI EUROPEAN STRAW SYRUP",
    qtyOnHand: 312,
  },
  {
    sku: "9556592529241",
    description: "DA VINCHI RASPBERRY RHAPSODY S",
    qtyOnHand: 0,
  },
  {
    sku: "9556592530575",
    description: "DAVINCHI PUMP 15M-0.53",
    qtyOnHand: 500,
  },
  {
    sku: "9556592535099",
    description: "DA VINCHI PEACH GARDEN SYRUP",
    qtyOnHand: 12,
  },
  {
    sku: "9556592580174",
    description: "DAVINCHI WATERMELON SYRUP",
    qtyOnHand: 1008,
  },
  {
    sku: "9556592584608",
    description: "DAVINCHI CARAMEL FLV SAU 2LIT",
    qtyOnHand: 342,
  },
  {
    sku: "9556592584905",
    description: "DAVINCHI SALTED CARAMEL FLV 2L",
    qtyOnHand: 351,
  },
  {
    sku: "9556592624724",
    description: "DAVINCHI MAJESTIC MANGO SYRUP",
    qtyOnHand: 168,
  },
  {
    sku: "9556592710076",
    description: "DAVINCH PECAN PARLINE SYRUP",
    qtyOnHand: 0,
  },
  {
    sku: "9556592710120",
    description: "DAVINCHI FRAGRANT LYCHEE SYRUP",
    qtyOnHand: 0,
  },
  {
    sku: "9556592740912",
    description: "DAVINCHI PISTACHIO FRUIT 1LIT",
    qtyOnHand: 36,
  },
  {
    sku: "9556592849554",
    description: "DAVINCHI CHEESE CAKE FLV 2LIT",
    qtyOnHand: 0,
  },
  {
    sku: "9556592949766",
    description: "DAVINCHI PASSIONFRUIT 1LIT",
    qtyOnHand: 174,
  },
  {
    sku: "9556592951721",
    description: "DAVINCHI MANGO FRUIT 1LIT",
    qtyOnHand: 546,
  },
  {
    sku: "979889074197",
    description: "CASTEL CUV PRE CAB MALBEC 75CL",
    qtyOnHand: 0,
  },
  {
    sku: "9798890741974",
    description: "RIFT VALLEY MALBEC DRY RED 75",
    qtyOnHand: 0,
  },
  {
    sku: "CH-0001",
    description: "CH. GRANDE - RENAISSANCE 2018",
    qtyOnHand: 48,
  },
  {
    sku: "CH-0002",
    description: "CH. DU CARTILLON 2015 3L",
    qtyOnHand: 0,
  },
  {
    sku: "EL0009090",
    description: "STOLI ELIT 100CL",
    qtyOnHand: 114,
  },
  {
    sku: "GL-0001",
    description: "DECANTER BELFESTA V 750 G ( PU",
    qtyOnHand: 0,
  },
  {
    sku: "GL-00010",
    description: "BANQUET LONGDRINK ( GERMANY )",
    qtyOnHand: 210,
  },
  {
    sku: "GL-00011",
    description: "OLD FASIONE BANQUET ( GERMANY",
    qtyOnHand: 0,
  },
  {
    sku: "GL-00012",
    description: "BANQUET WHITE WINE VIN BLANCO",
    qtyOnHand: 120,
  },
  {
    sku: "GL-00013",
    description: "WEIBWEIN  WHITE WINE 356ML",
    qtyOnHand: 120,
  },
  {
    sku: "GL-00014",
    description: "BANQUET BORDEAUX BURDEOS 606 M",
    qtyOnHand: 222,
  },
  {
    sku: "GL-0002",
    description: "CARAFE PURE V 1000V SLOVAKIA",
    qtyOnHand: 0,
  },
  {
    sku: "GL-0003",
    description: "WHISKY SHOW 60 (KT4) ITALY",
    qtyOnHand: 0,
  },
  {
    sku: "GL-0004",
    description: "LONGDRINK SHOW 79 ITALY",
    qtyOnHand: 0,
  },
  {
    sku: "GL-0005",
    description: "SPARKLING WINE BANQUET 7 WITH",
    qtyOnHand: 0,
  },
  {
    sku: "GL-0006",
    description: "BANQUET BURGUNDY TASTE  GERMAN",
    qtyOnHand: 66,
  },
  {
    sku: "GL-0007",
    description: "BURGUNDY BANQUET GOBLET (GERMA",
    qtyOnHand: 0,
  },
  {
    sku: "GL-0008",
    description: "BORDEAUX BANQUUET (GERMANY)",
    qtyOnHand: 0,
  },
  {
    sku: "GL-0009",
    description: "BRANDY INHALER MONDIAL 9 GERMA",
    qtyOnHand: 24,
  },
  {
    sku: "GL-001",
    description: "DECANTER BELFESTA V 750 G ( PU",
    qtyOnHand: 0,
  },
  {
    sku: "KR-00001",
    description: "KERRY BANANA FLAVOR 20 LITER",
    qtyOnHand: 500,
  },
  {
    sku: "KR-00002",
    description: "KERRY STRAWBERRY FLAVOUR 20LIT",
    qtyOnHand: 2000,
  },
  {
    sku: "KR-00003",
    description: "KERRY PEPPERMINTFLAVOUR 20LIT",
    qtyOnHand: 300,
  },
  {
    sku: "KR-00004",
    description: "KERRY MIXED FRUIT FLAVOUR 20LI",
    qtyOnHand: 500,
  },
  {
    sku: "KR-00005",
    description: "KERRY CAPPUCCINO FLAVOUR 20 LI",
    qtyOnHand: 2000,
  },
  {
    sku: "KR-00006",
    description: "KERRY ORANGE JUCY FLAVOUR 20 L",
    qtyOnHand: 1000,
  },
  {
    sku: "KR-00007",
    description: "KERRY VANILLA FLAVOUR 20 L",
    qtyOnHand: 4100,
  },
  {
    sku: "KR-00008",
    description: "KERRY COCOA FLAVOUR 20 L",
    qtyOnHand: 2000,
  },
  {
    sku: "KR-00009",
    description: "KERRY MANGO PULPY FLAVOUR 20 L",
    qtyOnHand: 2000,
  },
  {
    sku: "KR-00010",
    description: "KERRY CONDENSE MILK FLAV 20 L",
    qtyOnHand: 300,
  },
  {
    sku: "LQ-000045",
    description: "GAJA BRUNELLO DI MONTALC SANTA",
    qtyOnHand: 0,
  },
  {
    sku: "LQ-000046",
    description: "IDDA ETNA ROSSO 2022",
    qtyOnHand: 0,
  },
  {
    sku: "5000257013626",
    description: "J/W RED LABEL 100 CL",
    qtyOnHand: 1702,
  },
  {
    sku: "5000265001335",
    description: "WHITE HORSE 100CL",
    qtyOnHand: 4,
  },
  {
    sku: "5000267023652",
    description: "J/W BLACK LABEL 100CL",
    qtyOnHand: 465,
  },
  {
    sku: "50002670236523",
    description: "BLACK D-T FREE",
    qtyOnHand: 4400,
  },
  {
    sku: "5000267024400",
    description: "J/W BLACK LABEL 50 CL",
    qtyOnHand: 120,
  },
  {
    sku: "5000267106151",
    description: "J/W & SONS KING GEORGE V 1LIIT",
    qtyOnHand: 8,
  },
  {
    sku: "5000267112077",
    description: "J/W DOUBLE BLACK 100 CL",
    qtyOnHand: 2990,
  },
  {
    sku: "5000267113833",
    description: "J/W & SONS KING GEORGE 75 CL",
    qtyOnHand: 0,
  },
  {
    sku: "5000267114293",
    description: "J/W BLUE LABEL 100 CL",
    qtyOnHand: 376,
  },
  {
    sku: "5000267117584",
    description: "J/W GOLD LABEL RESERVE 100CL",
    qtyOnHand: 2206,
  },
  {
    sku: "5000267134321",
    description: "J/W GREEN LABEL 100 CL",
    qtyOnHand: 645,
  },
  {
    sku: "5000267165844",
    description: "J/W 18 YEARS AGED 1L",
    qtyOnHand: 297,
  },
  {
    sku: "5000267182360",
    description: "J/W GOLD LABEL 200 LIMITED",
    qtyOnHand: 804,
  },
  {
    sku: "5000281003641",
    description: "TALISKER SINGLE MALT 100 CL",
    qtyOnHand: 360,
  },
  {
    sku: "5000281051413",
    description: "THE SINGLETON SINGLE MALT 70 C",
    qtyOnHand: 1188,
  },
  {
    sku: "5000281056265",
    description: "DONJULIO 70 CRISTALINO 70CL",
    qtyOnHand: 0,
  },
  {
    sku: "5000289020800",
    description: "GORDON GIN 100CL",
    qtyOnHand: 13645,
  },
  {
    sku: "5000289929981",
    description: "GORDON GIN PINK 100 CL",
    qtyOnHand: 1866,
  },
  {
    sku: "5000291020805",
    description: "TANQUERY L DRY GIN 100 CL",
    qtyOnHand: 9660,
  },
  {
    sku: "5000299223055",
    description: "CAPITAN MORGON GOLD 100 CL",
    qtyOnHand: 204,
  },
  {
    sku: "5010103800457",
    description: "J & B WHISKEY  1LIT",
    qtyOnHand: 2364,
  },
  {
    sku: "5010103940184",
    description: "ROE & CO IRISH WHISKEY 70 CL",
    qtyOnHand: 420,
  },
  {
    sku: "5410316442930",
    description: "SMIRNOFF RED NO 21 100CL",
    qtyOnHand: 582,
  },
  {
    sku: "5410316518536",
    description: "SMIRNOFF VODKA RED 75 CL",
    qtyOnHand: 16118,
  },
  {
    sku: "6745445000858",
    description: "DONJULIO RESPOSADO 75 CL",
    qtyOnHand: 1627,
  },
  {
    sku: "674545000841",
    description: "DONJULIO BLANCO 75 CL",
    qtyOnHand: 24,
  },
  {
    sku: "674545000865",
    description: "DONJULIO ANEJO 75 CL",
    qtyOnHand: 53,
  },
  {
    sku: "7401005008604",
    description: "ZACAPA 75CL",
    qtyOnHand: 17,
  },
  {
    sku: "85156210015",
    description: "KETEL ONE VODKA 1LIT",
    qtyOnHand: 0,
  },
  {
    sku: "856724006107",
    description: "CASAMIGOS SILVER 100 CL",
    qtyOnHand: 2261,
  },
  {
    sku: "856724006206",
    description: "CASAMIGOS REPOSADO GOLD 100 CL",
    qtyOnHand: 151,
  },
  {
    sku: "87000006935",
    description: "CAPITAN MORGAN BLACK 100 CL",
    qtyOnHand: 9,
  },
  {
    sku: "88076161870",
    description: "CIROC BLUE 100CL",
    qtyOnHand: 128,
  },
  {
    sku: "DJ-0000009",
    description: "DONJULIO 1942",
    qtyOnHand: 10,
  },
];

function validateStockRows(rows: StockSeedRow[]) {
  const duplicateSkus = rows
    .map((row) => row.sku)
    .filter((sku, index, skus) => skus.indexOf(sku) !== index);

  if (duplicateSkus.length > 0) {
    throw new Error(
      `Duplicate Item ID values found in embedded stock rows: ${Array.from(new Set(duplicateSkus)).join(", ")}`,
    );
  }

  return rows;
}

function money(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0);
}

function printMissingItems(title: string, rows: StockSeedRow[]) {
  if (rows.length === 0) return;

  console.log(title);
  for (const row of rows) {
    console.log(`- ${row.sku} | qty ${row.qtyOnHand} | ${row.description}`);
  }
}

async function main() {
  const stockRows = validateStockRows(STOCK_SEED_ROWS);
  const [location, defaultCategory, defaultUnit] = await Promise.all([
    prisma.location.findUnique({ where: { code: LOCATION_CODE } }),
    prisma.category.upsert({
      where: { name: DEFAULT_CATEGORY_NAME },
      update: { isActive: true },
      create: { name: DEFAULT_CATEGORY_NAME, isActive: true },
    }),
    prisma.unit.upsert({
      where: { name: DEFAULT_UNIT_NAME },
      update: { isActive: true },
      create: { name: DEFAULT_UNIT_NAME, isActive: true },
    }),
  ]);

  if (!location) {
    throw new Error(
      `Location ${LOCATION_CODE} was not found. Run prisma/seed.ts before this seed.`,
    );
  }

  const products = await prisma.product.findMany({
    where: { sku: { in: stockRows.map((row) => row.sku) } },
    select: {
      id: true,
      sku: true,
      name: true,
      unitId: true,
      buyingPrice: true,
      description: true,
      category: { select: { name: true } },
    },
  });
  const productBySku = new Map(
    products.map((product) => [product.sku, product]),
  );
  const matchedRows = stockRows.filter((row) => productBySku.has(row.sku));
  const missingRows = stockRows.filter((row) => !productBySku.has(row.sku));
  const legacyPlaceholderRows = matchedRows.filter((row) => {
    const product = productBySku.get(row.sku);

    return (
      product?.category?.name === "Uncategorized" ||
      product?.description?.includes(
        "Created from Addis Ababa main stock workbook",
      )
    );
  });
  const missingRowsWithStock = missingRows.filter((row) => row.qtyOnHand !== 0);
  const rowsToSeed = stockRows;

  console.log("Addis Ababa embedded stock cross-check completed.");
  console.log(`Stock rows read: ${stockRows.length}`);
  console.log(
    `Rows already found in products before this run: ${matchedRows.length}`,
  );
  console.log(`Rows to create as new stock items: ${missingRows.length}`);
  console.log(
    `Legacy placeholder items to normalize: ${legacyPlaceholderRows.length}`,
  );
  console.log(
    `Missing rows with non-zero stock: ${missingRowsWithStock.length}`,
  );
  console.log(`Rows to seed, including zero stock rows: ${rowsToSeed.length}`);
  console.log(`Default category for new items: ${DEFAULT_CATEGORY_NAME}`);
  console.log(`Default unit for new items: ${DEFAULT_UNIT_NAME}`);

  printMissingItems(
    "New/missing stock items with non-zero quantity:",
    missingRowsWithStock,
  );

  let createdProducts = 0;
  let normalizedProducts = 0;

  for (const row of [...missingRows, ...legacyPlaceholderRows]) {
    const product = await prisma.product.upsert({
      where: { sku: row.sku },
      update: {
        name: row.description,
        categoryId: defaultCategory.id,
        companyId: null,
        brandId: null,
        unitId: defaultUnit.id,
        unitId: null,
        isActive: true,
      },
      create: {
        sku: row.sku,
        name: row.description,
        categoryId: defaultCategory.id,
        unitId: defaultUnit.id,
        unitId: null,
        companyId: null,
        brandId: null,
        description: null,
        isActive: true,
      },
      select: {
        id: true,
        sku: true,
        name: true,
        unitId: true,
        buyingPrice: true,
        description: true,
        category: { select: { name: true } },
      },
    });

    if (productBySku.has(row.sku)) {
      normalizedProducts += 1;
    } else {
      createdProducts += 1;
    }
    productBySku.set(product.sku, product);
  }

  const movementRows = rowsToSeed.map((row) => {
    const product = productBySku.get(row.sku);

    if (!product) {
      throw new Error(`Missing product after validation: ${row.sku}`);
    }

    return {
      locationId: location.id,
      productId: product.id,
      movementType: StockMovementType.ADJUSTMENT,
      quantity: row.qtyOnHand,
      unitCost: money(product.buyingPrice),
      unitValue: money(product.buyingPrice),
      movementDate: new Date("2026-05-27T00:00:00.000Z"),
      sourceType: SOURCE_TYPE,
      sourceId: SOURCE_ID,
      sourceLineId: row.sku,
      balanceAfter: row.qtyOnHand,
    };
  });

  await prisma.$transaction(
    async (tx) => {
      await tx.stockMovement.deleteMany({
        where: {
          locationId: location.id,
          sourceType: SOURCE_TYPE,
          sourceId: SOURCE_ID,
        },
      });

      await tx.stockMovement.createMany({ data: movementRows });
    },
    { timeout: 60_000 },
  );

  console.log(
    `Seeded ${rowsToSeed.length} Addis Ababa opening stock movement rows.`,
  );
  console.log(
    `Zero-quantity movement rows included: ${rowsToSeed.filter((row) => row.qtyOnHand === 0).length}`,
  );
  console.log(
    `New stock workbook items created or ensured: ${createdProducts}`,
  );
  console.log(
    `Legacy placeholder stock items normalized: ${normalizedProducts}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });