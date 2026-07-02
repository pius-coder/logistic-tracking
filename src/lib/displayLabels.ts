export type RequestStatusValue =
  | "EN_ATTENTE"
  | "EN_COURS"
  | "EN_PAUSE"
  | "PROBLEME"
  | "TERMINE"
  | "ANNULEE";

export type RequestProblemTypeValue =
  | "DOUANE"
  | "POLICE"
  | "DOCUMENTATION"
  | "RETARD_LOGISTIQUE"
  | "PAIEMENT"
  | "AUTRE";

export type TrajectoryStepTypeValue = "ORIGIN" | "ESCALE" | "DESTINATION";
export type PaymentMethodTypeValue =
  | "MOBILE_MONEY"
  | "BANK_TRANSFER"
  | "CASH_DEPOSIT"
  | "OTHER";
export type TransportModeValue = "AVION" | "BATEAU";
export type TradeDirectionValue = "IMPORT" | "EXPORT";
export type RequestTypeValue = "CATALOG" | "IMPORT_EXPORT";
export type PaymentStageValue = "ACOMPTE" | "SOLDE" | "TOTAL";
export type PaymentStatusValue = "EN_ATTENTE" | "VALIDE" | "REJETE";
export type NotificationTypeValue =
  | "GENERAL"
  | "REQUEST_CREATED"
  | "REQUEST_STATUS_UPDATED"
  | "TRAJECTORY_UPDATED"
  | "PAYMENT_TERMS_DEFINED"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_VALIDATED"
  | "PAYMENT_REJECTED"
  | "WHATSAPP_DISCUSSION_READY";
export type ProductReviewStatusValue = "EN_ATTENTE" | "APPROUVE" | "REJETE";

const requestStatusLabels: Record<RequestStatusValue, string> = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  EN_PAUSE: "En pause",
  PROBLEME: "Probleme",
  TERMINE: "Termine",
  ANNULEE: "Annulee",
};

const requestProblemLabels: Record<RequestProblemTypeValue, string> = {
  DOUANE: "Controle douanier",
  POLICE: "Controle de police",
  DOCUMENTATION: "Documents a completer",
  RETARD_LOGISTIQUE: "Retard logistique",
  PAIEMENT: "Paiement a verifier",
  AUTRE: "Situation particuliere",
};

const trajectoryStepTypeLabels: Record<TrajectoryStepTypeValue, string> = {
  ORIGIN: "Depart",
  ESCALE: "Escale",
  DESTINATION: "Arrivee",
};

const paymentMethodTypeLabels: Record<PaymentMethodTypeValue, string> = {
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Virement bancaire",
  CASH_DEPOSIT: "Depot en especes",
  OTHER: "Autre solution",
};

const transportModeLabels: Record<TransportModeValue, string> = {
  AVION: "Avion",
  BATEAU: "Bateau",
};

const tradeDirectionLabels: Record<TradeDirectionValue, string> = {
  IMPORT: "Import",
  EXPORT: "Export",
};

const requestTypeLabels: Record<RequestTypeValue, string> = {
  CATALOG: "Catalogue",
  IMPORT_EXPORT: "Transit",
};

const paymentStageLabels: Record<PaymentStageValue, string> = {
  ACOMPTE: "Acompte",
  SOLDE: "Solde",
  TOTAL: "Total",
};

const paymentStatusLabels: Record<PaymentStatusValue, string> = {
  EN_ATTENTE: "En attente",
  VALIDE: "Valide",
  REJETE: "Rejete",
};

const notificationTypeLabels: Record<NotificationTypeValue, string> = {
  GENERAL: "Information",
  REQUEST_CREATED: "Nouvelle demande",
  REQUEST_STATUS_UPDATED: "Mise a jour du suivi",
  TRAJECTORY_UPDATED: "Parcours logistique",
  PAYMENT_TERMS_DEFINED: "Conditions de paiement",
  PAYMENT_SUBMITTED: "Preuve envoyee",
  PAYMENT_VALIDATED: "Paiement valide",
  PAYMENT_REJECTED: "Paiement a revoir",
  WHATSAPP_DISCUSSION_READY: "Discussion WhatsApp",
};

const productReviewStatusLabels: Record<ProductReviewStatusValue, string> = {
  EN_ATTENTE: "En attente",
  APPROUVE: "Valide",
  REJETE: "Refuse",
};

export function getRequestStatusLabel(status: RequestStatusValue | string | null | undefined) {
  return status ? requestStatusLabels[status as RequestStatusValue] ?? status : "";
}

export function getRequestProblemLabel(problemType: RequestProblemTypeValue | string | null | undefined) {
  return problemType ? requestProblemLabels[problemType as RequestProblemTypeValue] ?? problemType : "";
}

export function getTrajectoryStepTypeLabel(stepType: TrajectoryStepTypeValue | string | null | undefined) {
  return stepType ? trajectoryStepTypeLabels[stepType as TrajectoryStepTypeValue] ?? stepType : "";
}

export function getPaymentMethodTypeLabel(paymentMethodType: PaymentMethodTypeValue | string | null | undefined) {
  return paymentMethodType ? paymentMethodTypeLabels[paymentMethodType as PaymentMethodTypeValue] ?? paymentMethodType : "";
}

export function getTransportModeLabel(transportMode: TransportModeValue | string | null | undefined) {
  return transportMode ? transportModeLabels[transportMode as TransportModeValue] ?? transportMode : "";
}

export function getTradeDirectionLabel(tradeDirection: TradeDirectionValue | string | null | undefined) {
  return tradeDirection ? tradeDirectionLabels[tradeDirection as TradeDirectionValue] ?? tradeDirection : "";
}

export function getRequestTypeLabel(requestType: RequestTypeValue | string | null | undefined) {
  return requestType ? requestTypeLabels[requestType as RequestTypeValue] ?? requestType : "";
}

export function getPaymentStageLabel(stage: PaymentStageValue | string | null | undefined) {
  return stage ? paymentStageLabels[stage as PaymentStageValue] ?? stage : "";
}

export function getPaymentStatusLabel(paymentStatus: PaymentStatusValue | string | null | undefined) {
  return paymentStatus ? paymentStatusLabels[paymentStatus as PaymentStatusValue] ?? paymentStatus : "";
}

export function getNotificationTypeLabel(notificationType: NotificationTypeValue | string | null | undefined) {
  return notificationType ? notificationTypeLabels[notificationType as NotificationTypeValue] ?? notificationType : "";
}

export function getProductReviewStatusLabel(reviewStatus: ProductReviewStatusValue | string | null | undefined) {
  return reviewStatus ? productReviewStatusLabels[reviewStatus as ProductReviewStatusValue] ?? reviewStatus : "";
}
