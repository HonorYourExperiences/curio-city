import type { Band, Lang } from "../../types/bydt";
export function detectCircumscription(text: string) {
  return /(?:girls?|boys?|niñas?|niños?).*(?:can't|cannot|only|no pueden)|(?:bad|terrible|hate|scared|miedo|mal[oa]).*(?:math|science|matem|ciencia)|(?:poor|rich|prestige|pobre|rico)/i.test(
    text,
  );
}
export function deterministicJourney(
  socCode: string,
  interest: string,
  lang: Lang,
  band: Band,
) {
  const es = lang === "es";
  const helping = socCode === "25-2021.00";
  return {
    reflective: helping
      ? es
        ? "Quieres crear algo que ayude a alguien."
        : "You want to make something that helps someone."
      : es
        ? "Te gusta construir y descubrir qué pasa."
        : "You like making things and seeing what happens.",
    narrative: helping
      ? es
        ? "Quienes enseñan inventan juegos para aprender juntos."
        : "Teachers invent games to help people learn together."
      : es
        ? "Quienes diseñan también prueban ideas con papel."
        : "Designers test their ideas with paper, too.",
    persuasive: detectCircumscription(interest)
      ? es
        ? "Cualquiera puede practicar. Empieza con una pequeña prueba."
        : "Anyone can practice this. Start with one small try."
      : es
        ? "No tiene que salir perfecto. ¡Prueba y cambia algo!"
        : band === "Builder_9_13"
          ? "An imperfect first attempt gives you something useful to improve."
          : "It doesn’t need to be perfect. Try, then change one thing!",
    instructional: es
      ? "Vamos a probar una idea fuera de la pantalla."
      : "Let’s test an idea away from the screen.",
  };
}
