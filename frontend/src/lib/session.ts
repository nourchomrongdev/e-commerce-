"use client";

import { CART_UPDATED_EVENT, CART_STORAGE_KEY } from "./cart";

export async function clearSessionData() {
  window.localStorage.clear();
  window.sessionStorage.clear();

  document.cookie.split(";").forEach((cookie) => {
    const separator = cookie.indexOf("=");
    const name = (separator >= 0 ? cookie.slice(0, separator) : cookie).trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  });

  if ("caches" in window) {
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
  }

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  window.localStorage.removeItem(CART_STORAGE_KEY);
}
