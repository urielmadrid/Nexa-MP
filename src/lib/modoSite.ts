"use client";

import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

/**
 * Modo do site: "completo" (todas as animações e efeitos) ou "leve" (bem menos animações e efeitos, para aparelhos
 * mais antigos ou conexão lenta). A escolha fica só no navegador (localStorage) e vira o atributo data-modo no <html>:
 *
 *   data-modo="completo"  -> site como sempre foi
 *   data-modo="leve"      -> regras "Modo leve" no fim de app/globals.css + componentes sem animação em JavaScript
 *   data-modo="pendente"  -> a pessoa ainda não escolheu: o site já se comporta como o leve (a janelinha de escolha está aberta)
 *
 * O atributo é definido por um script no <head> (SCRIPT_MODO, usado em app/layout.tsx), antes de a página aparecer.
 */
export type ModoSite = "completo" | "leve";
export type ModoAtual = ModoSite | "pendente";

export const CHAVE_MODO = "nexa-modo";
/** Disparado em window para abrir a janelinha de escolha (link "Modo do site", no rodapé). */
export const EVENTO_ESCOLHER_MODO = "nexa:escolher-modo";
/** Disparado em window quando o modo muda. */
export const EVENTO_MODO_MUDOU = "nexa:modo-mudou";

/** Roda no <head>, antes da página aparecer. Robôs de busca e testes automáticos recebem o modo completo, sem janelinha. */
export const SCRIPT_MODO = `(function(){try{var d=document.documentElement,m=null;try{m=localStorage.getItem("${CHAVE_MODO}")}catch(e){}if(m!=="leve"&&m!=="completo"){m=(navigator.webdriver||/bot|crawl|spider|slurp|lighthouse|facebookexternalhit|headless/i.test(navigator.userAgent))?"completo":"pendente"}d.setAttribute("data-modo",m)}catch(e){}})();`;

export function modoAtual(): ModoAtual {
  if (typeof document === "undefined") return "pendente";
  const valor = document.documentElement.getAttribute("data-modo");
  return valor === "completo" || valor === "leve" ? valor : "pendente";
}

export function lerModoSalvo(): ModoSite | null {
  try {
    const valor = window.localStorage.getItem(CHAVE_MODO);
    return valor === "completo" || valor === "leve" ? valor : null;
  } catch {
    return null;
  }
}

/** Guarda a escolha e aplica na hora. Se o navegador não deixar guardar, vale só até fechar a página. */
export function salvarModo(modo: ModoSite): void {
  try {
    window.localStorage.setItem(CHAVE_MODO, modo);
  } catch {
    /* sem armazenamento: a escolha vale só nesta visita */
  }
  document.documentElement.setAttribute("data-modo", modo);
  window.dispatchEvent(new Event(EVENTO_MODO_MUDOU));
}

export function abrirEscolhaModo(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENTO_ESCOLHER_MODO));
}

function assinar(aviso: () => void): () => void {
  window.addEventListener(EVENTO_MODO_MUDOU, aviso);
  return () => window.removeEventListener(EVENTO_MODO_MUDOU, aviso);
}

/**
 * Modo atual, atualizado quando a pessoa troca.
 * No servidor e na hidratação vale "completo" (o HTML sai igual para todos); logo depois o React lê o <html data-modo>.
 * Assim quem está no modo completo não perde as animações de entrada, e o CSS do modo leve já vale antes disso.
 */
export function useModoSite(): ModoAtual {
  return useSyncExternalStore(assinar, modoAtual, () => "completo");
}

/** true no modo leve e enquanto a pessoa ainda não escolheu. */
export function useModoLeve(): boolean {
  return useModoSite() !== "completo";
}

/** Igual ao "reduzir movimento" do aparelho, mas também liga no modo leve. Use no lugar de useReducedMotion() do framer-motion. */
export function useMovimentoReduzido(): boolean {
  const reduzirDoAparelho = useReducedMotion();
  const leve = useModoLeve();
  return !!reduzirDoAparelho || leve;
}

/** Palpite simples de aparelho mais fraco (pouca memória, poucos núcleos, economia de dados ou rede lenta). Só para sugerir. */
export function aparelhoParecePouco(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const pouca = typeof n.deviceMemory === "number" && n.deviceMemory <= 2;
  const poucosNucleos = typeof n.hardwareConcurrency === "number" && n.hardwareConcurrency <= 4;
  const economia = n.connection?.saveData === true;
  const redeLenta = n.connection?.effectiveType === "2g" || n.connection?.effectiveType === "slow-2g" || n.connection?.effectiveType === "3g";
  const reduzir = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return pouca || poucosNucleos || economia || redeLenta || reduzir;
}