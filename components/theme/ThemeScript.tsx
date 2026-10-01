// Applies the saved theme before first paint (Next 16 guide: "Preventing flash before hydration").
// Same storage key as Ibera Landing v6: localStorage["ibera-theme"] = "dark" | "light". Dark is the default.
const script = `(function(){try{var t=localStorage.getItem("ibera-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
