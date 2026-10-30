import type { Bundle, Lang } from "../../types/bydt";
import { seedDictionary } from "../bydt/seed-dictionary";
const data = [
  {
    soc: "17-2051.00",
    en: "Civil Engineers",
    es: "Ingenieros civiles",
    description:
      "Perform engineering duties in planning, designing, and overseeing construction and maintenance of building structures and facilities, such as roads, railroads, airports, bridges, harbors, channels, dams, irrigation projects, pipelines, power plants, and water and sewage systems.",
    spanish: "Planifican y diseñan estructuras como puentes y carreteras.",
    ids: [0, 2, 15],
    dwa: "4.A.1.b.2.c.4",
    activity: "Test characteristics of materials or structures.",
    keywords: "build bridge paper structures construir puente ingeniero",
    cluster: "Architecture & Construction",
  },
  {
    soc: "27-1021.00",
    en: "Commercial and Industrial Designers",
    es: "Diseñadores comerciales e industriales",
    description:
      "Design and develop manufactured products, such as cars, home appliances, and children's toys. Combine artistic talent with research on product use, marketing, and materials to create the most functional and appealing product design.",
    spanish:
      "Diseñan productos útiles, como juguetes y aparatos para el hogar.",
    ids: [1, 0, 16],
    dwa: "4.A.3.a.2.aj.1",
    activity: "Build models, patterns, or templates.",
    keywords: "draw design toy invent art diseño dibujar juguete inventar",
    cluster: "Arts, A/V Technology & Communications",
  },
  {
    soc: "25-2021.00",
    en: "Elementary School Teachers, Except Special Education",
    es: "Maestros de escuela primaria",
    description:
      "Teach academic and social skills to students at the elementary school level.",
    spanish:
      "Enseñan habilidades académicas y sociales en la escuela primaria.",
    ids: [10, 18, 19],
    dwa: "4.A.4.b.3.b.6",
    activity: "Apply multiple teaching methods.",
    keywords: "help people teach friend ayudar personas enseñar amigo",
    cluster: "Education & Training",
  },
  {
    soc: "17-2141.00",
    en: "Mechanical Engineers",
    es: "Ingenieros mecánicos",
    description:
      "Perform engineering duties in planning and designing tools, engines, machines, and other mechanically functioning equipment. Oversee installation, operation, maintenance, and repair of equipment such as centralized heat, gas, water, and steam systems.",
    spanish: "Diseñan herramientas, máquinas y equipos mecánicos.",
    ids: [2, 16, 7],
    dwa: "4.A.3.b.2.d.1",
    activity: "Create models of engineering designs or methods.",
    keywords: "how work machine robot things engine funciona máquina robot",
    cluster: "Science, Technology, Engineering & Mathematics",
  },
];
export const fixtureData = data;
export function fixtureBundle(soc: string, language: Lang): Bundle {
  const item = data.find((x) => x.soc === soc);
  if (!item) throw new Error("Unknown occupation");
  return {
    occupation: {
      socCode: item.soc,
      title: language === "es" ? item.es : item.en,
      description: language === "es" ? item.spanish : item.description,
      brightOutlook: false,
      sourceMode: "fixture",
      sourceVersion: "31.0",
      language,
    },
    elements: item.ids.map((i) => ({
      id: seedDictionary[i].onetElementId,
      name: seedDictionary[i].rawOnetName,
      domain: seedDictionary[i].domain,
    })),
    dwas: [{ id: item.dwa, name: item.activity }],
  };
}
export function searchFixtures(query: string, lang: Lang) {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const stop = new Set(
    "i a an the to my me want like how do can things and for of is am yo un una el la los las quiero me mi como que de en y por con".split(
      " ",
    ),
  );
  const words = normalize(query)
    .split(/[^\p{L}\p{N}.-]+/u)
    .filter((w) => w.length > 1 && !stop.has(w));
  return data
    .map((item) => {
      const text = normalize(
        item.en + " " + item.es + " " + item.keywords + " " + item.soc,
      );
      const score = words.reduce(
        (sum, word) =>
          sum + (text.includes(word.replace(/ing$|s$/g, "")) ? 1 : 0),
        0,
      );
      return { item, score };
    })
    .filter(({ score }) => !words.length || score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => fixtureBundle(item.soc, lang).occupation);
}
