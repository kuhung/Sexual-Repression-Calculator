import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export const SEO = ({ title, description, canonicalUrl, noindex }: SEOProps) => {
  const location = useLocation();
  const currentUrl = canonicalUrl || `https://sri.kuhung.me${location.pathname}${location.search}`;

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (title) {
      document.title = title;
      upsertMeta("property", "og:title", title);
    }

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
    }

    upsertCanonical(currentUrl);
    upsertMeta("property", "og:url", currentUrl);

    if (noindex) {
      upsertMeta("name", "robots", "noindex,nofollow");
    } else {
      removeMeta("name", "robots");
    }
  }, [canonicalUrl, currentUrl, description, location.pathname, location.search, noindex, title]);

  return null;
};

function upsertMeta(attributeName: "name" | "property", attributeValue: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attributeName}="${attributeValue}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function removeMeta(attributeName: "name" | "property", attributeValue: string) {
  document.head
    .querySelectorAll(`meta[${attributeName}="${attributeValue}"]`)
    .forEach((element) => element.remove());
}

function upsertCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", url);
}
