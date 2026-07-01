import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

const OPENCODE_BASE = "https://opencode.ai/zen/v1";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

function parseValue(value: string): string | number | null {
  if (value === "null" || value === "") return null;
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== "") return num;
  return value;
}

function parseXmlToFields(xml: string) {
  const cleaned = xml.replace(/^```(?:xml)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = xmlParser.parse(cleaned);
  const root = parsed.product || parsed;
  return {
    name: String(root.name || ""),
    slug: String(root.slug || ""),
    summary: String(root.summary || ""),
    heroTagline: root.heroTagline ? parseValue(root.heroTagline) : null,
    description: String(root.description || ""),
    basePriceUsd: Number(root.basePriceUsd || 0),
    minimumOrderQuantity: Number(root.minimumOrderQuantity || 1),
    freightNotes: root.freightNotes ? parseValue(root.freightNotes) : null,
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENCODE_API_KEY not configured" }, { status: 500 });
  }

  const { description } = await req.json();
  if (!description || typeof description !== "string" || description.trim().length < 5) {
    return NextResponse.json({ error: "Description trop courte" }, { status: 400 });
  }

  const systemMessage = `Tu es un assistant spécialisé dans la création de fiches produits pour JC Import Express, une plateforme d'import/export entre la Chine et l'Afrique.

À partir d'une description libre (souvent une annonce WhatsApp ou Facebook avec emojis), génère les champs d'une fiche produit au format XML uniquement, sans balise \`\`\`.

Structure XML attendue :
<product>
  <name>Nom commercial du produit, max 200 caractères</name>
  <slug>Slug kebab-case sans accents ni emojis, ex: toyota-yaris-1-6-automatique</slug>
  <summary>Résumé accrocheur en 1-2 phrases avec emojis pertinents, max 500 caractères</summary>
  <heroTagline>Slogan court et percutant avec emojis, max 100 caractères</heroTagline>
  <description>Description complète en texte brut avec emojis et sauts de ligne. PAS de HTML.</description>
  <basePriceUsd>Prix en USD. Si FCFA: diviser par 600.</basePriceUsd>
  <minimumOrderQuantity>Quantité minimum, 1 par défaut</minimumOrderQuantity>
  <freightNotes>Notes transport/fret avec emojis</freightNotes>
</product>

Règles :
- La description utilise des emojis comme séparateurs visuels (📍 🚗 ⭐ ✅ 🚚 etc.) et des sauts de ligne pour structurer.
- Extrait toutes les caractéristiques techniques (année, km, motorisation, carburant, etc.) dans la description.
- Le slug doit être en minuscules, sans accents, sans emojis, avec des tirets.
- Met "null" si un champ optionnel n'est pas pertinent.
- Réponds UNIQUEMENT avec le XML, rien d'autre.`;

  try {
    const res = await fetch(`${OPENCODE_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "minimax-m2.5-free",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: description.trim() },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenCode Zen error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Réponse vide de l'IA" }, { status: 502 });
    }

    const fields = parseXmlToFields(content);

    if (!fields.name) {
      return NextResponse.json({ error: "XML invalide - nom manquant", raw: content }, { status: 502 });
    }

    return NextResponse.json({ fields });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
