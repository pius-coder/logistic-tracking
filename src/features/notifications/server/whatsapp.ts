import "server-only";

import { z } from "zod";
import { defineNotificationFn } from "@/aura/server/notifications";


/**
 * 80 templates WhatsApp pour l'envoi d'OTP.
 * Selection aleatoire a chaque envoi pour eviter le spam WhatsApp.
 * {code} = code OTP, {minutes} = duree de validite.
 */
const OTP_TEMPLATES = [
  // Templates simples
  "Votre code JC Import Express : {code}. Valable {minutes} minutes.",
  "Code de verification JC Import Express : {code}. Expiration : {minutes} min.",
  "JC Import Express : votre code est {code}. Utilisez-le dans les {minutes} prochaines minutes.",
  "Voici votre code JC Import Express : {code}. Il expire dans {minutes} minutes.",
  "JC Import Express — Code : {code}. Valide {minutes} min.",
  "Votre code de securite JC Import Express : {code}. Duree de vie : {minutes} minutes.",
  "Code JC Import Express pour votre inscription : {code}. Valable {minutes} min.",
  "JC Import Express : tapez {code} pour confirmer votre compte. Expire dans {minutes} min.",
  "Votre code d'activation JC Import Express est {code}. Vous avez {minutes} minutes.",
  "Code de validation JC Import Express : {code}. Ne le partagez pas. Valide {minutes} min.",

  // Templates formels
  "Cher utilisateur, votre code JC Import Express est {code}. Il est valable {minutes} minutes.",
  "Madame/Monsieur, voici votre code de verification JC Import Express : {code}. Expiration : {minutes} minutes.",
  "Nous vous envoyons ce code JC Import Express : {code}. Veuillez l'utiliser dans les {minutes} minutes suivantes.",
  "Votre code d'authentification JC Import Express : {code}. Il expirera dans {minutes} minutes. Merci.",
  "JC Import Express confirme votre demande. Code : {code}. Valabilite : {minutes} minutes.",
  "Conformement a votre demande, votre code JC Import Express est {code}. Valide {minutes} minutes.",
  "JC Import Express : code de securite {code}. Veuillez ne pas le communiquer. Expiration {minutes} min.",
  "Nous vous transmettons votre code JC Import Express : {code}. Duree de validite : {minutes} minutes.",
  "Votre code unique JC Import Express : {code}. A utiliser sous {minutes} minutes.",
  "JC Import Express — Verification de compte. Code : {code}. Expire dans {minutes} minutes.",

  // Templates amicaux
  "Salut ! Ton code JC Import Express est {code}. Tu as {minutes} minutes pour l'utiliser.",
  "Hey ! Voici ton code JC Import Express : {code}. Vite, il expire dans {minutes} min !",
  "JC Import Express te dit : utilise le code {code}. Tu as {minutes} minutes devant toi.",
  "Coucou ! Ton code JC Import Express : {code}. N'attends pas, il expire dans {minutes} min !",
  "Yo ! Code JC Import Express : {code}. Valable {minutes} minutes. A plus !",
  "Hello ! Ton code JC Import Express est {code}. Tu as {minutes} minutes. Go go go !",
  "Salut l'ami ! Ton code JC Import Express : {code}. Il ne sera plus valable dans {minutes} min.",
  "JC Import Express : ton code perso est {code}. Utilise-le vite, {minutes} minutes chrono !",
  "Bonjouuur ! Ton code JC Import Express : {code}. Tu as {minutes} minutes pour finir ton inscription.",
  "Hey hey ! Code JC Import Express pour toi : {code}. Expire dans {minutes} min. Bon courage !",

  // Templates urgents
  "ATTENTION : Votre code JC Import Express {code} expire dans {minutes} minutes !",
  "URGENT — Code JC Import Express : {code}. Il ne reste que {minutes} minutes !",
  "Derniere chance ! Code JC Import Express {code} — Expiration dans {minutes} minutes.",
  "Vite ! Votre code JC Import Express {code} est valable {minutes} minutes seulement.",
  "Code JC Import Express {code}. Action requise sous {minutes} minutes sinon expire.",
  "TICK TICK TICK ⏰ Code JC Import Express : {code}. Plus que {minutes} minutes !",
  "Votre code JC Import Express {code} — Ne tardez pas ! Valide {minutes} minutes.",
  "RAPPEL : Code JC Import Express {code}. Il disparait dans {minutes} minutes.",
  "Code JC Import Express : {code}. Vous avez {minutes} minutes. Pas une de plus !",
  "ALERT : Code JC Import Express {code}. Expiration imminente : {minutes} minutes.",

  // Templates avec emojis
  "🔐 Votre code JC Import Express : {code}. ⏳ Valable {minutes} minutes.",
  "📲 Code JC Import Express : {code}. ✅ Valide {minutes} min.",
  "🚀 JC Import Express : votre code est {code}. ⏰ Expire dans {minutes} minutes.",
  "🔑 Code d'acces JC Import Express : {code}. 🔒 Ne le partagez pas. {minutes} min.",
  "📱 JC Import Express : tapez {code} pour continuer. ⌛ {minutes} minutes restantes.",
  "🎯 Code JC Import Express : {code}. ⚡ Utilisez-le vite, {minutes} min !",
  "🛡️ Votre code de securite JC Import Express : {code}. 🕐 Valide {minutes} min.",
  "✨ JC Import Express : code {code}. ⌛ Expiration dans {minutes} minutes.",
  "📝 Inscription JC Import Express. Code : {code}. ⏱️ {minutes} minutes.",
  "🌍 JC Import Express : bienvenue ! Code {code}. ⏳ {minutes} min de validite.",

  // Templates avec instructions
  "Entrez ce code JC Import Express pour finir l'inscription : {code}. Valable {minutes} min.",
  "Pour verifier votre compte JC Import Express, utilisez le code : {code}. Expire {minutes} min.",
  "Copiez ce code {code} dans l'application JC Import Express. Vous avez {minutes} minutes.",
  "JC Import Express : saisissez {code} sur la page d'inscription. Valide {minutes} minutes.",
  "Terminez votre inscription JC Import Express avec le code : {code}. Delai : {minutes} min.",
  "Pour activer votre compte JC Import Express, entrez : {code}. Expiration {minutes} min.",
  "Code de confirmation JC Import Express : {code}. A entrer dans l'app. Valable {minutes} min.",
  "JC Import Express demande ce code : {code}. Tapez-le dans le formulaire. {minutes} min restantes.",
  "Inscription JC Import Express en cours. Code requis : {code}. Il expire dans {minutes} minutes.",
  "Finalisez votre compte JC Import Express. Code : {code}. Temps limite : {minutes} minutes.",

  // Templates courts
  "JC Import Express : {code} — {minutes} min.",
  "Code {code}. JC Import Express. {minutes} min.",
  "GI : {code}. Valide {minutes} min.",
  "{code} = votre code JC Import Express. {minutes} min.",
  "GI code : {code}. Expire {minutes} min.",
  "JC Import Express OTP : {code}. {minutes} min.",
  "Code GI {code}. {minutes} min restantes.",
  "GI — {code}. Utilisez sous {minutes} min.",
  "Votre code GI : {code}. {minutes} min.",
  "JC Import Express : {code} (expire {minutes} min).",

  // Templates en anglais
  "Your JC Import Express code is {code}. Valid for {minutes} minutes.",
  "JC Import Express verification code: {code}. Expires in {minutes} minutes.",
  "Use code {code} to complete your JC Import Express signup. {minutes} minutes left.",
  "JC Import Express: your one-time code is {code}. It expires in {minutes} min.",
  "Your JC Import Express OTP: {code}. Please use within {minutes} minutes.",
  "JC Import Express security code {code}. Valid for {minutes} minutes only.",
  "Complete your JC Import Express registration with code {code}. {minutes} min remaining.",
  "JC Import Express account verification. Code: {code}. Expiry: {minutes} minutes.",
  "Here's your JC Import Express code: {code}. Don't share it. {minutes} minutes validity.",
  "JC Import Express: enter {code} to verify your account. Expires in {minutes} min.",

  // Templates creatifs
  "Le code secret JC Import Express est : {code}. Il s'autodétruira dans {minutes} minutes.",
  "Missions JC Import Express : entrez {code} pour activer votre compte. Delai : {minutes} min.",
  "JC Import Express vous envoie une cle : {code}. Elle ne fonctionne que {minutes} minutes.",
  "Votre passeport JC Import Express : code {code}. Expiration dans {minutes} minutes.",
  "JC Import Express : votre sesame est {code}. Magique pendant {minutes} minutes !",
  "Code d'or JC Import Express : {code}. Brillant pendant {minutes} minutes.",
  "JC Import Express active votre acces. Cle : {code}. Fenetre : {minutes} minutes.",
  "Bienvenue chez JC Import Express ! Votre code d'entree : {code}. Valide {minutes} min.",
  "JC Import Express : votre cle d'activation {code}. Tournez-la dans {minutes} minutes.",
  "Code JC Import Express debloque : {code}. Il se referme dans {minutes} minutes.",
];

function getRandomOtpTemplate(): string {
  const idx = Math.floor(Math.random() * OTP_TEMPLATES.length);
  return OTP_TEMPLATES[idx];
}

function formatOtpMessage(template: string, code: string, minutes: number): string {
  return template.replace("{code}", code).replace("{minutes}", String(minutes));
}

function buildOtpMessage(code: string, minutes: number): string {
  const template = getRandomOtpTemplate();
  return formatOtpMessage(template, code, minutes);
}

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, "").replace(/\+/g, "");
  if (!cleaned.startsWith("225") && cleaned.length === 8) {
    return `225${cleaned}`;
  }
  return cleaned;
}

type WhatsAppSendResult =
  | { sent: true }
  | { sent: false; reason: "no_whatsapp" | "instance_down" | "error"; error?: string };

async function evolutionRequestRaw(path: string, payload: Record<string, unknown>): Promise<Response> {
  const baseUrl = (process.env.EVOLUTION_API_BASE_URL || "").replace(/\/$/, "");
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.EVOLUTION_API_KEY || "",
      "User-Agent": "JC Import Express/1.0",
    },
    body: JSON.stringify(payload),
  });
}

function isNoWhatsAppError(body: string): boolean {
  try {
    const parsed = JSON.parse(body);
    const msg = parsed?.response?.message;
    if (Array.isArray(msg) && msg.length > 0 && msg[0]?.exists === false) return true;
    return false;
  } catch {
    return false;
  }
}

function isInstanceDownError(status: number, body: string): boolean {
  if (status !== 500 && status !== 428) return false;
  try {
    const parsed = JSON.parse(body);
    const raw = parsed?.response?.message ?? parsed?.output?.payload?.message ?? "";
    const text = Array.isArray(raw) ? raw.join(" ") : String(raw);
    return /connection closed/i.test(text);
  } catch {
    return /connection closed/i.test(body);
  }
}

export async function sendWhatsAppText(phoneNumber: string, message: string): Promise<WhatsAppSendResult> {
  const instanceId = process.env.EVOLUTION_API_INSTANCE_ID || "jc-import-express";
  const number = normalizePhoneNumber(phoneNumber);
  const payload = { number, text: message, delay: 800, linkPreview: false };

  try {
    const res = await evolutionRequestRaw(`/message/sendText/${instanceId}`, payload);
    const body = await res.text();
    if (res.ok) return { sent: true };
    if (isNoWhatsAppError(body)) return { sent: false, reason: "no_whatsapp" };
    if (isInstanceDownError(res.status, body)) {
      return { sent: false, reason: "instance_down", error: `Evolution API ${res.status}: instance disconnected` };
    }
    return { sent: false, reason: "error", error: `Evolution API ${res.status}: ${body.slice(0, 500)}` };
  } catch (err) {
    return { sent: false, reason: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

export const whatsappOtpNotification = defineNotificationFn("whatsapp.otp")
  .payload(
    z.object({
      phoneE164: z.string(),
      code: z.string(),
      purpose: z.string(),
      expiresAt: z.string(),
    }),
  )
  .handler(async ({ ctx, payload }) => {
    const expiresAt = new Date(payload.expiresAt);
    const minutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / (60 * 1000)));
    const message = buildOtpMessage(payload.code, minutes);

    const result = await sendWhatsAppText(payload.phoneE164, message);
    if (result.sent) {
      ctx.log.info("WhatsApp OTP delivered", {
        phoneE164: payload.phoneE164,
        purpose: payload.purpose,
      });
      return;
    }

    ctx.log.error("WhatsApp OTP delivery failed", {
      phoneE164: payload.phoneE164,
      purpose: payload.purpose,
      reason: result.reason,
      error: result.error,
    });

    if (result.reason === "no_whatsapp") {
      const phoneIdentity = await ctx.db.auraPhoneIdentity.findUnique({
        where: { phoneE164: payload.phoneE164 },
        select: { userId: true },
      });
      if (phoneIdentity) {
        await ctx.db.auraUser.update({
          where: { id: phoneIdentity.userId },
          data: { whatsappChallenge: true, hadWhatsapp: false },
        });
      }
      throw new Error("WHATSAPP_INVALID_NUMBER");
    }
  });

const WELCOME_TEMPLATES = [
  "Bienvenue sur JC Import Express ! 🎉 Vous recevrez desormais toutes vos notifications ici.",
  "Salut et bienvenue chez JC Import Express ! 👋 On est la pour vous accompagner dans vos imports.",
  "Merci de vous etre inscrit sur JC Import Express ! ✅ On vous tient au courant de tout ici.",
  "Bienvenue dans la famille JC Import Express ! 🚀 Vos notifications arrivent sur ce chat.",
  "JC Import Express vous accueille ! 🌍 Desormais, suivez toutes vos commandes ici.",
  "Hey, bienvenue sur JC Import Express ! 💪 On s'occupe de tout, vous suivez tout ici.",
];

export const whatsappWelcomeNotification = defineNotificationFn("whatsapp.welcome")
  .payload(
    z.object({
      phoneE164: z.string(),
    }),
  )
  .handler(async ({ ctx, payload }) => {
    const template = WELCOME_TEMPLATES[Math.floor(Math.random() * WELCOME_TEMPLATES.length)];
    const result = await sendWhatsAppText(payload.phoneE164, template);

    if (result.sent) {
      await ctx.db.auraPhoneIdentity.update({
        where: { phoneE164: payload.phoneE164 },
        data: { whatsappVerifiedAt: new Date() },
      });
      const phoneIdentity = await ctx.db.auraPhoneIdentity.findUnique({
        where: { phoneE164: payload.phoneE164 },
        select: { userId: true },
      });
      if (phoneIdentity) {
        await ctx.db.auraUser.update({
          where: { id: phoneIdentity.userId },
          data: { whatsappChallenge: true, hadWhatsapp: true },
        });
      }
      ctx.log.info("WhatsApp welcome delivered + verified", { phoneE164: payload.phoneE164 });
    } else if (result.reason === "no_whatsapp") {
      const phoneIdentity = await ctx.db.auraPhoneIdentity.findUnique({
        where: { phoneE164: payload.phoneE164 },
        select: { userId: true },
      });
      if (phoneIdentity) {
        await ctx.db.auraUser.update({
          where: { id: phoneIdentity.userId },
          data: { whatsappChallenge: true, hadWhatsapp: false },
        });
      }
      ctx.log.warn("WhatsApp welcome skipped — number not on WhatsApp", { phoneE164: payload.phoneE164 });
    } else {
      ctx.log.error("WhatsApp welcome delivery failed", {
        phoneE164: payload.phoneE164,
        error: result.error,
      });
    }
  });

export const whatsappSendNotification = defineNotificationFn("whatsapp.send")
  .payload(
    z.object({
      phoneNumber: z.string(),
      message: z.string(),
    }),
  )
  .handler(async ({ ctx, payload }) => {
    const result = await sendWhatsAppText(payload.phoneNumber, payload.message);
    if (result.sent) {
      ctx.log.info("WhatsApp message delivered", { phoneNumber: payload.phoneNumber });
      return;
    }

    ctx.log.warn("WhatsApp message not delivered", {
      phoneNumber: payload.phoneNumber,
      reason: result.reason,
      error: result.error,
    });

    if (result.reason === "error") {
      try {
        const admins = await ctx.db.auraUser.findMany({
          where: { isAdmin: true },
          select: { id: true },
        });
        await ctx.db.jcNotification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: "GENERAL" as const,
            title: "WhatsApp indisponible",
            message: `L'envoi WhatsApp a echoue. Verifiez l'API Evolution.${result.error ? ` Erreur: ${result.error}` : ""}`,
            deepLink: "/dashboard/admin",
          })),
        });
      } catch (notifErr) {
        ctx.log.error("Failed to create admin WhatsApp alert", { error: notifErr });
      }
    }
  });
