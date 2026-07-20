import { PREFERENCE_KEYS, PREFERENCE_REGISTRY } from "@/lib/preferences/preferences-config";

const registry = Object.fromEntries(
  PREFERENCE_KEYS.map((key) => [
    key,
    {
      attribute: PREFERENCE_REGISTRY[key].attribute,
      defaultValue: PREFERENCE_REGISTRY[key].defaultValue,
      values: [...PREFERENCE_REGISTRY[key].values],
    },
  ]),
);

const scriptContent = `(function(){try{var c=document.cookie.split(";").reduce(function(a,x){var p=x.trim().split("=");a[decodeURIComponent(p[0])]=decodeURIComponent(p[1]||"");return a},{});var r=${JSON.stringify(registry)};var h=document.documentElement;Object.keys(r).forEach(function(k){var d=r[k];var v=c[k]&&d.values.includes(c[k])?c[k]:d.defaultValue;h.setAttribute(d.attribute,v);});}catch(e){}})();`;

export function ThemeBootScript() {
  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}
